
/**
 * Base fetcher with error handling, auth, and multi-tenancy support
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string, orgId?: string) {
  // Use relative URL for Next.js proxying (/api/...)
  const url = endpoint;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (orgId) {
    headers['x-org-id'] = orgId;
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `HTTP error! status: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Not JSON or empty body
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
