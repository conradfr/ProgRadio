
# Avoid caching 301/302 from thumbnails

sub vcl_backend_response {
    # Happens after we have read the response headers from the backend.
    #
    # Here you clean the response headers, removing silly Set-Cookie headers
    # and other mistakes your backend does.

    if (beresp.status == 301 || beresp.status == 302) {
      set beresp.http.Location = regsub(beresp.http.Location, ":[0-9]+", "");
        set beresp.uncacheable = true;
        set beresp.ttl = 120s;
        return (deliver);
    }

}
