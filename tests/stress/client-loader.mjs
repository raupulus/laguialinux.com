export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('useApiClient.ts')) {
    let source = typeof result.source === 'string' ? result.source : result.source.toString();
    source = source.replaceAll('import.meta.client', '(globalThis.__IS_CLIENT__ !== undefined ? globalThis.__IS_CLIENT__ : true)');
    return { ...result, source };
  }
  return result;
}
