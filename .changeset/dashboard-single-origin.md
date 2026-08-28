---
"pstdio": patch
---

Open the dashboard on the API's own origin. `pst` started a second static
dashboard server on port 5555 while the API ran elsewhere, so every dashboard
request to the runtime was cross-origin and rejected with 403 ("Unable to load
agent availability"). The API auto-start already serves the dashboard on one
origin — point the browser there and drop the extra server.
