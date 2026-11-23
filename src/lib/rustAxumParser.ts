import type { RustBackendFile } from '../types/domain';

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface ParsedCargoDependency {
  name: string;
  version: string;
  features: string[];
}

export interface ParsedCrateInfo {
  name: string;
  version: string;
  edition: string;
  description: string;
  dependencies: ParsedCargoDependency[];
}

export interface ParsedEnvVar {
  name: string;
  defaultValue: string;
  sourceLine: number;
}

export interface ParsedSerdeField {
  rustName: string;
  jsonName: string;
  rustType: string;
  tsType: string;
  optional: boolean;
  flattened: boolean;
  refStruct?: string;
}

export interface ParsedSerdeStruct {
  name: string;
  renameAll?: string;
  derives: string[];
  fields: ParsedSerdeField[];
  lineStart: number;
  lineEnd: number;
  rawSource: string;
}

export interface ParsedStatusOutcome {
  code: number;
  label: string;
  dtoType: string;
  isError: boolean;
}

export interface ParsedAxumEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  handlerName: string;
  routeLine: number;
  handlerLineStart: number | null;
  handlerLineEnd: number | null;
  handlerSource: string;
  summary: string;
  group: string;
  pathParams: { name: string; rustType: string; tsType: string }[];
  queryStructName: string | null;
  requestBodyStructName: string | null;
  responseType: string;
  responseStructName: string | null;
  responseIsArray: boolean;
  errorStructName: string | null;
  usesAppState: boolean;
  statuses: ParsedStatusOutcome[];
  validationHints: string[];
}

export interface ParsedRustAxumSpec {
  crateInfo: ParsedCrateInfo;
  endpoints: ParsedAxumEndpoint[];
  structs: ParsedSerdeStruct[];
  envVars: ParsedEnvVar[];
  middlewares: string[];
  validationConstants: Record<string, string[]>;
  files: RustBackendFile[];
}

export function snakeToCamel(input: string): string {
  return input.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

export function rustTypeToTs(rustType: string): {
  tsType: string;
  optional: boolean;
  refStruct?: string;
} {
  const cleaned = rustType.trim();

  const optMatch = cleaned.match(/^Option<(.+)>$/);
  if (optMatch) {
    const inner = rustTypeToTs(optMatch[1]);
    return {
      tsType: inner.tsType,
      optional: true,
      refStruct: inner.refStruct,
    };
  }

  const vecMatch = cleaned.match(/^Vec<(.+)>$/);
  if (vecMatch) {
    const inner = rustTypeToTs(vecMatch[1]);
    return {
      tsType: `${inner.tsType}[]`,
      optional: false,
      refStruct: inner.refStruct,
    };
  }

  if (
    cleaned === 'String' ||
    cleaned === '&str' ||
    cleaned === "&'static str"
  ) {
    return { tsType: 'string', optional: false };
  }

  if (
    /^(u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64)$/.test(
      cleaned,
    )
  ) {
    return { tsType: 'number', optional: false };
  }

  if (cleaned === 'bool') {
    return { tsType: 'boolean', optional: false };
  }

  return { tsType: cleaned, optional: false, refStruct: cleaned };
}

function parseCargoToml(content: string): ParsedCrateInfo {
  const info: ParsedCrateInfo = {
    name: 'petrotechnics-api',
    version: '1.0.0',
    edition: '2021',
    description: '',
    dependencies: [],
  };

  let section = '';
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const sectionMatch = line.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }

    if (section === 'package') {
      const kv = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]*)"$/);
      if (kv) {
        const [, key, value] = kv;
        if (key === 'name') info.name = value;
        else if (key === 'version') info.version = value;
        else if (key === 'edition') info.edition = value;
        else if (key === 'description') info.description = value;
      }
    } else if (section === 'dependencies') {
      const simple = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"$/);
      if (simple) {
        info.dependencies.push({
          name: simple[1],
          version: simple[2],
          features: [],
        });
        continue;
      }
      const inlineTable = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{(.+)\}$/);
      if (inlineTable) {
        const name = inlineTable[1];
        const body = inlineTable[2];
        const verMatch = body.match(/version\s*=\s*"([^"]+)"/);
        const featMatch = body.match(/features\s*=\s*\[([^\]]*)\]/);
        const features = featMatch
          ? featMatch[1]
              .split(',')
              .map((s) => s.trim().replace(/^"|"$/g, ''))
              .filter(Boolean)
          : [];
        info.dependencies.push({
          name,
          version: verMatch ? verMatch[1] : '*',
          features,
        });
      }
    }
  }

  return info;
}

function parseModelsRs(content: string): ParsedSerdeStruct[] {
  const lines = content.split(/\r?\n/);
  const structs: ParsedSerdeStruct[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const structMatch = line.match(/^pub\s+struct\s+([A-Za-z0-9_]+)\s*\{/);
    if (!structMatch) {
      i += 1;
      continue;
    }

    const name = structMatch[1];
    // Collect preceding #[...] attributes
    const attrs: string[] = [];
    let back = i - 1;
    while (back >= 0 && lines[back].trim().startsWith('#[')) {
      attrs.unshift(lines[back].trim());
      back -= 1;
    }

    const lineStart = back + 2; // 1-indexed
    const derives: string[] = [];
    let renameAll: string | undefined;

    for (const attr of attrs) {
      const deriveMatch = attr.match(/^#\[derive\((.+)\)\]$/);
      if (deriveMatch) {
        deriveMatch[1]
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean)
          .forEach((d) => derives.push(d));
      }
      const renameMatch = attr.match(/rename_all\s*=\s*"([^"]+)"/);
      if (renameMatch) {
        renameAll = renameMatch[1];
      }
    }

    const fields: ParsedSerdeField[] = [];
    let pendingFlatten = false;
    let pendingRename: string | undefined;
    let endIdx = i;

    for (let j = i + 1; j < lines.length; j += 1) {
      const inner = lines[j].trim();
      if (inner === '}') {
        endIdx = j;
        break;
      }
      if (!inner || inner.startsWith('//')) continue;

      if (inner.startsWith('#[')) {
        if (inner.includes('flatten')) {
          pendingFlatten = true;
        }
        const fieldRename = inner.match(/rename\s*=\s*"([^"]+)"/);
        if (fieldRename) {
          pendingRename = fieldRename[1];
        }
        continue;
      }

      const fieldMatch = inner.match(/^pub\s+([a-zA-Z0-9_]+)\s*:\s*(.+?),?$/);
      if (fieldMatch) {
        const rustName = fieldMatch[1];
        const rustType = fieldMatch[2].replace(/,$/, '').trim();
        const mapped = rustTypeToTs(rustType);
        const jsonName =
          pendingRename ??
          (renameAll === 'camelCase' ? snakeToCamel(rustName) : rustName);

        fields.push({
          rustName,
          jsonName,
          rustType,
          tsType: mapped.tsType,
          optional: mapped.optional,
          flattened: pendingFlatten,
          refStruct: mapped.refStruct,
        });
        pendingFlatten = false;
        pendingRename = undefined;
      }
    }

    const rawSource = lines.slice(Math.max(0, back + 1), endIdx + 1).join('\n');
    structs.push({
      name,
      renameAll,
      derives,
      fields,
      lineStart,
      lineEnd: endIdx + 1,
      rawSource,
    });

    i = endIdx + 1;
  }

  return structs;
}

interface ParsedHandlerInfo {
  name: string;
  lineStart: number;
  lineEnd: number;
  rawSource: string;
  usesAppState: boolean;
  pathExtractors: { paramVar: string; rustType: string }[];
  queryStructName: string | null;
  jsonBodyStructName: string | null;
  returnTypeRaw: string;
  responseType: string;
  responseStructName: string | null;
  responseIsArray: boolean;
  errorStructName: string | null;
  statuses: ParsedStatusOutcome[];
  validationHints: string[];
}

function parseValidationConstants(content: string): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const regex = /const\s+([A-Z0-9_]+)\s*:\s*\[[^\]]+\]\s*=\s*\[([^\]]+)\]/g;
  let match: RegExpExecArray | null = regex.exec(content);
  while (match) {
    const constName = match[1];
    const items = match[2]
      .split(',')
      .map((s) => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean);
    result[constName] = items;
    match = regex.exec(content);
  }
  return result;
}

function parseHandlersRs(content: string): {
  handlers: Map<string, ParsedHandlerInfo>;
  validationConstants: Record<string, string[]>;
} {
  const handlers = new Map<string, ParsedHandlerInfo>();
  const validationConstants = parseValidationConstants(content);
  const lines = content.split(/\r?\n/);

  let i = 0;
  while (i < lines.length) {
    const fnStartMatch = lines[i].match(
      /^\s*pub\s+async\s+fn\s+([a-zA-Z0-9_]+)\s*\(/,
    );
    if (!fnStartMatch) {
      i += 1;
      continue;
    }

    const name = fnStartMatch[1];
    const lineStart = i + 1;

    // Gather signature lines up to the opening brace `{` of the function body
    let sigEnd = i;
    while (sigEnd < lines.length && !lines[sigEnd].includes('{')) {
      sigEnd += 1;
    }

    // Track brace depth to find function end
    let depth = 0;
    let bodyEnd = sigEnd;
    for (let j = sigEnd; j < lines.length; j += 1) {
      for (const ch of lines[j]) {
        if (ch === '{') depth += 1;
        else if (ch === '}') depth -= 1;
      }
      bodyEnd = j;
      if (depth <= 0 && j >= sigEnd) {
        break;
      }
    }

    const signature = lines
      .slice(i, sigEnd + 1)
      .join(' ')
      .replace(/\{.*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    const rawSource = lines.slice(i, bodyEnd + 1).join('\n');

    // Extract parameter section between first `(` and matching `)`
    const openParen = signature.indexOf('(');
    const arrowIdx = signature.indexOf('->');
    const closeParen =
      arrowIdx > -1
        ? signature.lastIndexOf(')', arrowIdx)
        : signature.lastIndexOf(')');
    const paramsSection =
      openParen > -1 && closeParen > openParen
        ? signature.slice(openParen + 1, closeParen)
        : '';
    const returnTypeRaw =
      arrowIdx > -1 ? signature.slice(arrowIdx + 2).trim() : '';

    const usesAppState = /State\s*\(/.test(paramsSection);

    const pathExtractors: { paramVar: string; rustType: string }[] = [];
    const pathRegex =
      /Path\(\s*([a-zA-Z0-9_]+)\s*\)\s*:\s*Path<\s*([^>]+)\s*>/g;
    let pMatch: RegExpExecArray | null = pathRegex.exec(paramsSection);
    while (pMatch) {
      pathExtractors.push({
        paramVar: pMatch[1],
        rustType: pMatch[2].trim(),
      });
      pMatch = pathRegex.exec(paramsSection);
    }

    const queryMatch = paramsSection.match(
      /Query\([^)]*\)\s*:\s*Query<\s*([A-Za-z0-9_]+)\s*>/,
    );
    const queryStructName = queryMatch ? queryMatch[1] : null;

    const jsonBodyMatch = paramsSection.match(
      /Json\([^)]*\)\s*:\s*Json<\s*([A-Za-z0-9_]+)\s*>/,
    );
    const jsonBodyStructName = jsonBodyMatch ? jsonBodyMatch[1] : null;

    // Parse return DTO type from Json<...> using balanced angle brackets
    const jsonGenerics: string[] = [];
    let scanPos = 0;
    while (scanPos < returnTypeRaw.length) {
      const marker = returnTypeRaw.indexOf('Json<', scanPos);
      if (marker === -1) break;
      let bracketDepth = 1;
      let cursor = marker + 5;
      while (cursor < returnTypeRaw.length && bracketDepth > 0) {
        if (returnTypeRaw[cursor] === '<') bracketDepth += 1;
        else if (returnTypeRaw[cursor] === '>') bracketDepth -= 1;
        cursor += 1;
      }
      if (bracketDepth === 0) {
        jsonGenerics.push(
          returnTypeRaw.slice(marker + 5, cursor - 1).trim(),
        );
      }
      scanPos = cursor;
    }
    const primaryResponseType = jsonGenerics[0] ?? 'serde_json::Value';
    const errorStructName = jsonGenerics[1] ?? null;

    const vecMatch = primaryResponseType.match(/^Vec<([A-Za-z0-9_]+)>$/);
    const responseIsArray = Boolean(vecMatch);
    const responseStructName = vecMatch
      ? vecMatch[1]
      : /^[A-Za-z0-9_]+$/.test(primaryResponseType)
        ? primaryResponseType
        : null;

    // Determine status codes from handler body
    const statuses: ParsedStatusOutcome[] = [];
    if (rawSource.includes('StatusCode::CREATED')) {
      statuses.push({
        code: 201,
        label: 'Created',
        dtoType: primaryResponseType,
        isError: false,
      });
    } else {
      statuses.push({
        code: 200,
        label: 'OK',
        dtoType: primaryResponseType,
        isError: false,
      });
    }

    if (rawSource.includes('StatusCode::BAD_REQUEST')) {
      statuses.push({
        code: 400,
        label: 'Bad Request',
        dtoType: errorStructName ?? 'ApiError',
        isError: true,
      });
    }
    if (rawSource.includes('StatusCode::UNAUTHORIZED')) {
      statuses.push({
        code: 401,
        label: 'Unauthorized',
        dtoType: errorStructName ?? 'ApiError',
        isError: true,
      });
    }
    if (rawSource.includes('StatusCode::FORBIDDEN')) {
      statuses.push({
        code: 403,
        label: 'Forbidden',
        dtoType: errorStructName ?? 'ApiError',
        isError: true,
      });
    }
    if (rawSource.includes('StatusCode::NOT_FOUND')) {
      statuses.push({
        code: 404,
        label: 'Not Found',
        dtoType: errorStructName ?? 'ApiError',
        isError: true,
      });
    }

    // Extract inline validation hints & error strings
    const validationHints: string[] = [];
    for (const [constName, values] of Object.entries(validationConstants)) {
      if (rawSource.includes(constName)) {
        validationHints.push(`${constName}: ${values.join(', ')}`);
      }
    }
    if (rawSource.includes('quantity_mt <= 0.0')) {
      validationHints.push('quantityMt must be greater than 0');
    }
    if (rawSource.includes("!payload.email.contains('@')")) {
      validationHints.push('email must be a valid corporate email containing @');
    }
    if (rawSource.includes('rfq_store_path')) {
      validationHints.push(
        'Persists records atomically to JSON store configured via RFQ_STORE_PATH',
      );
    }

    handlers.set(name, {
      name,
      lineStart,
      lineEnd: bodyEnd + 1,
      rawSource,
      usesAppState,
      pathExtractors,
      queryStructName,
      jsonBodyStructName,
      returnTypeRaw,
      responseType: primaryResponseType,
      responseStructName,
      responseIsArray,
      errorStructName,
      statuses,
      validationHints,
    });

    i = bodyEnd + 1;
  }

  return { handlers, validationConstants };
}

function inferEndpointMeta(
  method: HttpMethod,
  routePath: string,
  handlerName: string,
  readmeLines: string[],
): { summary: string; group: string } {
  // Prefer README bullet description if present for exact method + path
  const escapedPath = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const readmePattern = new RegExp(
    `\`${method}\\s+${escapedPath}(?:\\?[^\`]*)?\`\\s*[—–-]\\s*(.+)$`,
    'i',
  );
  for (const line of readmeLines) {
    const match = line.match(readmePattern);
    if (match) {
      const group = deriveGroup(routePath);
      return { summary: match[1].trim(), group };
    }
  }

  // Fallback natural summary derived from method + handler identifier
  const readableHandler = handlerName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    summary: `${readableHandler} via Axum handler`,
    group: deriveGroup(routePath),
  };
}

function deriveGroup(routePath: string): string {
  const segments = routePath.split('/').filter(Boolean);
  const resource = segments[0] === 'api' ? segments[1] : segments[0];
  switch (resource) {
    case 'health':
      return 'System & Runtime';
    case 'products':
      return 'Commodity Catalog';
    case 'corridors':
      return 'Trade Logistics';
    case 'rfq':
      return 'Commercial RFQ';
    default:
      return resource
        ? resource.charAt(0).toUpperCase() + resource.slice(1)
        : 'API Core';
  }
}

function parseMainRs(
  content: string,
  handlers: Map<string, ParsedHandlerInfo>,
  readmeContent: string,
): {
  endpoints: ParsedAxumEndpoint[];
  envVars: ParsedEnvVar[];
  middlewares: string[];
} {
  const lines = content.split(/\r?\n/);
  const readmeLines = readmeContent.split(/\r?\n/);
  const endpoints: ParsedAxumEndpoint[] = [];
  const envVars: ParsedEnvVar[] = [];
  const middlewares: string[] = [];

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;

    // Parse .route("/api/...", get(fn).post(fn2))
    const routeMatch = line.match(/\.route\(\s*"([^"]+)"\s*,\s*(.+)\)\s*$/);
    if (routeMatch) {
      const routePath = routeMatch[1];
      const methodChain = routeMatch[2];
      const methodRegex =
        /\b(get|post|put|patch|delete|head|options)\s*\(\s*([a-zA-Z0-9_:]+)\s*\)/g;
      let mMatch: RegExpExecArray | null = methodRegex.exec(methodChain);
      while (mMatch) {
        const method = mMatch[1].toUpperCase() as HttpMethod;
        const fullHandler = mMatch[2];
        const handlerName = fullHandler.includes('::')
          ? fullHandler.split('::').pop() || fullHandler
          : fullHandler;
        const handlerInfo = handlers.get(handlerName);

        // Extract :param or {param} tokens from routePath
        const pathParams = [...routePath.matchAll(/(?::([a-zA-Z0-9_]+)|\{([a-zA-Z0-9_]+)\})/g)].map(
          (pm, pIdx) => {
            const paramName = pm[1] || pm[2];
            const matchedExtractor = handlerInfo?.pathExtractors[pIdx];
            const rustType = matchedExtractor?.rustType ?? 'String';
            const { tsType } = rustTypeToTs(rustType);
            return { name: paramName, rustType, tsType };
          },
        );

        const { summary, group } = inferEndpointMeta(
          method,
          routePath,
          handlerName,
          readmeLines,
        );

        endpoints.push({
          id: `${method.toLowerCase()}-${routePath.replace(/[^a-zA-Z0-9]+/g, '-')}`,
          method,
          path: routePath,
          handlerName,
          routeLine: lineNum,
          handlerLineStart: handlerInfo?.lineStart ?? null,
          handlerLineEnd: handlerInfo?.lineEnd ?? null,
          handlerSource: handlerInfo?.rawSource ?? '',
          summary,
          group,
          pathParams,
          queryStructName: handlerInfo?.queryStructName ?? null,
          requestBodyStructName: handlerInfo?.jsonBodyStructName ?? null,
          responseType: handlerInfo?.responseType ?? 'serde_json::Value',
          responseStructName: handlerInfo?.responseStructName ?? null,
          responseIsArray: handlerInfo?.responseIsArray ?? false,
          errorStructName: handlerInfo?.errorStructName ?? null,
          usesAppState: handlerInfo?.usesAppState ?? false,
          statuses: handlerInfo?.statuses ?? [
            { code: 200, label: 'OK', dtoType: 'Value', isError: false },
          ],
          validationHints: handlerInfo?.validationHints ?? [],
        });

        mMatch = methodRegex.exec(methodChain);
      }
    }

    // Parse env::var("...")
    const envMatch = line.match(/std::env::var\(\s*"([A-Z0-9_]+)"\s*\)/);
    if (envMatch) {
      const envName = envMatch[1];
      let defaultValue = 'required';
      const defaultStr = line.match(/unwrap_or_else\([^"]*"([^"]+)"/);
      if (defaultStr) {
        defaultValue = defaultStr[1];
      } else {
        // Check next few lines for unwrap_or(...)
        const windowStr = lines.slice(idx, idx + 4).join(' ');
        const defaultNum = windowStr.match(/unwrap_or\(\s*([^)]+)\s*\)/);
        if (defaultNum) {
          defaultValue = defaultNum[1].trim();
        }
      }
      envVars.push({ name: envName, defaultValue, sourceLine: lineNum });
    }

    // Parse .layer(...)
    const layerMatch = line.match(/\.layer\(\s*(.+)\s*\)\s*;?\s*$/);
    if (layerMatch) {
      const rawLayer = layerMatch[1].trim();
      if (rawLayer === 'cors') {
        middlewares.push('CorsLayer (allow_origin: Any, methods: Any, headers: Any)');
      } else {
        middlewares.push(rawLayer);
      }
    }
  });

  return { endpoints, envVars, middlewares };
}

export function parseRustAxumBackend(
  files: RustBackendFile[],
): ParsedRustAxumSpec {
  const findContent = (suffix: string) =>
    files.find((f) => f.path.endsWith(suffix))?.content ?? '';

  const cargoRaw = findContent('Cargo.toml');
  const mainRaw = findContent('src/main.rs');
  const handlersRaw = findContent('src/handlers.rs');
  const modelsRaw = findContent('src/models.rs');
  const readmeRaw = findContent('README.md');

  const crateInfo = parseCargoToml(cargoRaw);
  const structs = parseModelsRs(modelsRaw);
  const { handlers, validationConstants } = parseHandlersRs(handlersRaw);
  const { endpoints, envVars, middlewares } = parseMainRs(
    mainRaw,
    handlers,
    readmeRaw,
  );

  return {
    crateInfo,
    endpoints,
    structs,
    envVars,
    middlewares,
    validationConstants,
    files,
  };
}

/**
 * Resolves a Serde struct's wire-format JSON fields, expanding #[serde(flatten)] fields inline.
 */
export function resolveFlattenedFields(
  structName: string,
  structMap: Map<string, ParsedSerdeStruct>,
  visited = new Set<string>(),
): ParsedSerdeField[] {
  const def = structMap.get(structName);
  if (!def || visited.has(structName)) return [];
  visited.add(structName);

  const out: ParsedSerdeField[] = [];
  for (const field of def.fields) {
    if (field.flattened && field.refStruct && structMap.has(field.refStruct)) {
      out.push(...resolveFlattenedFields(field.refStruct, structMap, visited));
    } else {
      out.push(field);
    }
  }
  return out;
}

export function buildTypeScriptInterface(
  def: ParsedSerdeStruct,
  structMap: Map<string, ParsedSerdeStruct>,
): string {
  const resolved = resolveFlattenedFields(def.name, structMap);
  const body = resolved
    .map(
      (f) => `  ${f.jsonName}${f.optional ? '?' : ''}: ${f.tsType};`,
    )
    .join('\n');
  return `export interface ${def.name} {\n${body}\n}`;
}

export function buildAllTypeScriptInterfaces(
  structs: ParsedSerdeStruct[],
): string {
  const map = new Map(structs.map((s) => [s.name, s]));
  return structs.map((s) => buildTypeScriptInterface(s, map)).join('\n\n');
}

export function buildSamplePayloadForStruct(
  structName: string,
  structMap: Map<string, ParsedSerdeStruct>,
): Record<string, unknown> {
  const fields = resolveFlattenedFields(structName, structMap);
  const sampleValues: Record<string, unknown> = {
    productSlug: 'hdpe-pe100',
    productName: 'High-Density Polyethylene (HDPE)',
    grade: 'PE100 Black',
    quantityMt: 500,
    destination: 'Jebel Ali, UAE',
    incoterm: 'FOB',
    packaging: '25 kg PE bags on shrink-wrapped pallets',
    inspection: 'SGS',
    companyName: 'Gulf Polymer Industries LLC',
    contactName: 'Tariq Al-Mansoori',
    email: 'procurement@gulfpolymer.ae',
    phone: '+971 4 555 0198',
    notes: 'SGS pre-shipment quality certificate required prior to B/L release.',
  };

  const out: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.jsonName in sampleValues) {
      out[field.jsonName] = sampleValues[field.jsonName];
    } else if (field.tsType === 'number') {
      out[field.jsonName] = 100;
    } else if (field.tsType === 'boolean') {
      out[field.jsonName] = true;
    } else if (field.tsType.endsWith('[]')) {
      out[field.jsonName] = [];
    } else if (field.refStruct && structMap.has(field.refStruct)) {
      out[field.jsonName] = buildSamplePayloadForStruct(
        field.refStruct,
        structMap,
      );
    } else {
      out[field.jsonName] = '';
    }
  }
  return out;
}

export function resolveEndpointUrl(
  baseUrl: string,
  endpoint: ParsedAxumEndpoint,
  pathValues: Record<string, string>,
  queryValues: Record<string, string>,
): string {
  let resolvedPath = endpoint.path;
  for (const param of endpoint.pathParams) {
    const val = encodeURIComponent(
      (pathValues[param.name] || `:${param.name}`).trim(),
    );
    resolvedPath = resolvedPath
      .replace(`:${param.name}`, val)
      .replace(`{${param.name}}`, val);
  }

  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(queryValues)) {
    const trimmed = v.trim();
    if (trimmed) {
      search.set(k, trimmed);
    }
  }
  const qs = search.toString();
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  return `${cleanBase}${resolvedPath}${qs ? `?${qs}` : ''}`;
}

export function buildCurlSnippet(
  baseUrl: string,
  endpoint: ParsedAxumEndpoint,
  pathValues: Record<string, string>,
  queryValues: Record<string, string>,
  requestBodyJson: string,
): string {
  const effectiveBase =
    baseUrl.trim() || 'http://127.0.0.1:8080';
  const url = resolveEndpointUrl(
    effectiveBase,
    endpoint,
    pathValues,
    queryValues,
  );

  if (endpoint.method === 'GET' || endpoint.method === 'DELETE') {
    return `curl -i -X ${endpoint.method} \\\n  "${url}" \\\n  -H "Accept: application/json"`;
  }

  const compactOrPretty = requestBodyJson.trim() || '{}';
  return `curl -i -X ${endpoint.method} \\\n  "${url}" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json" \\\n  -d '${compactOrPretty.replace(/'/g, "'\\''")}'`;
}

export function buildTypeScriptFetchSnippet(
  baseUrl: string,
  endpoint: ParsedAxumEndpoint,
  pathValues: Record<string, string>,
  queryValues: Record<string, string>,
  requestBodyJson: string,
): string {
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const relativeOrFull = resolveEndpointUrl(
    cleanBase,
    endpoint,
    pathValues,
    queryValues,
  );
  const responseTsType = endpoint.responseIsArray
    ? `${endpoint.responseStructName ?? 'unknown'}[]`
    : endpoint.responseStructName ?? 'unknown';

  const hasBody =
    endpoint.method === 'POST' ||
    endpoint.method === 'PUT' ||
    endpoint.method === 'PATCH';

  if (!hasBody) {
    return `const response = await fetch('${relativeOrFull}', {
  method: '${endpoint.method}',
  headers: {
    Accept: 'application/json',
  },
});

if (!response.ok) {
  const err: { error: string } = await response.json();
  throw new Error(err.error || \`HTTP \${response.status}\`);
}

const data: ${responseTsType} = await response.json();`;
  }

  const formattedBody = requestBodyJson
    .trim()
    .split('\n')
    .map((line, idx) => (idx === 0 ? line : `  ${line}`))
    .join('\n');

  return `const payload = ${formattedBody || '{}'};

const response = await fetch('${relativeOrFull}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  const err: { error: string } = await response.json();
  throw new Error(err.error || \`HTTP \${response.status}\`);
}

const created: ${responseTsType} = await response.json();`;
}

function fieldToJsonSchema(
  field: ParsedSerdeField,
  structMap: Map<string, ParsedSerdeStruct>,
): Record<string, unknown> {
  if (field.tsType.endsWith('[]')) {
    const inner = field.tsType.slice(0, -2);
    if (structMap.has(inner)) {
      return {
        type: 'array',
        items: { $ref: `#/components/schemas/${inner}` },
      };
    }
    return {
      type: 'array',
      items: { type: inner === 'number' ? 'number' : 'string' },
    };
  }
  if (field.refStruct && structMap.has(field.refStruct)) {
    return { $ref: `#/components/schemas/${field.refStruct}` };
  }
  if (field.tsType === 'number') return { type: 'number' };
  if (field.tsType === 'boolean') return { type: 'boolean' };
  return { type: 'string' };
}

export function buildOpenApiSpec(
  spec: ParsedRustAxumSpec,
  serverUrl: string,
): Record<string, unknown> {
  const structMap = new Map(spec.structs.map((s) => [s.name, s]));
  const paths: Record<string, Record<string, unknown>> = {};

  for (const ep of spec.endpoints) {
    const openApiPath = ep.path.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    if (!paths[openApiPath]) paths[openApiPath] = {};

    const parameters: Record<string, unknown>[] = ep.pathParams.map((p) => ({
      name: p.name,
      in: 'path',
      required: true,
      schema: { type: p.tsType === 'number' ? 'number' : 'string' },
    }));

    if (ep.queryStructName && structMap.has(ep.queryStructName)) {
      const qFields = resolveFlattenedFields(ep.queryStructName, structMap);
      for (const qf of qFields) {
        parameters.push({
          name: qf.jsonName,
          in: 'query',
          required: !qf.optional,
          schema: fieldToJsonSchema(qf, structMap),
        });
      }
    }

    const responses: Record<string, unknown> = {};
    for (const st of ep.statuses) {
      const schemaRef = st.isError
        ? { $ref: `#/components/schemas/${ep.errorStructName || 'ApiError'}` }
        : ep.responseIsArray && ep.responseStructName
          ? {
              type: 'array',
              items: {
                $ref: `#/components/schemas/${ep.responseStructName}`,
              },
            }
          : ep.responseStructName && structMap.has(ep.responseStructName)
            ? { $ref: `#/components/schemas/${ep.responseStructName}` }
            : { type: 'object' };

      responses[String(st.code)] = {
        description: st.label,
        content: {
          'application/json': { schema: schemaRef },
        },
      };
    }

    const op: Record<string, unknown> = {
      operationId: ep.handlerName,
      summary: ep.summary,
      tags: [ep.group],
      ...(parameters.length > 0 ? { parameters } : {}),
      ...(ep.requestBodyStructName
        ? {
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: `#/components/schemas/${ep.requestBodyStructName}`,
                  },
                },
              },
            },
          }
        : {}),
      responses,
    };

    paths[openApiPath][ep.method.toLowerCase()] = op;
  }

  const schemas: Record<string, unknown> = {};
  for (const s of spec.structs) {
    const resolved = resolveFlattenedFields(s.name, structMap);
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const f of resolved) {
      properties[f.jsonName] = fieldToJsonSchema(f, structMap);
      if (!f.optional) required.push(f.jsonName);
    }
    schemas[s.name] = {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  return {
    openapi: '3.1.0',
    info: {
      title: spec.crateInfo.name,
      version: spec.crateInfo.version,
      description: spec.crateInfo.description,
    },
    servers: [
      {
        url: serverUrl.trim() || 'http://127.0.0.1:8080',
        description: 'PetroTechnics Rust Axum API',
      },
    ],
    paths,
    components: { schemas },
  };
}
