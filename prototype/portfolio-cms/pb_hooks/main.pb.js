// Redirect the bare root to the admin UI, so you can type just
// admin.pilgrimage.media (or the tailnet host) and land on /_/ without the path.
// PocketBase serves its dashboard at /_/ and returns 404 at /, which is the only
// reason the path was needed at all.
routerAdd("GET", "/", (e) => {
  return e.redirect(302, "/_/");
});
