# Reporting a security problem

**Please do not open a public issue for anything security-related.**

Use GitHub's private reporting instead — the **Security** tab of this repository,
then **Report a vulnerability**. It opens a thread only you and I can read, so a
problem can be fixed before it is described in public.

I will confirm I have seen it. This is a personal site maintained by one person,
so a fix may take a few days; if it is being actively exploited, say so and I
will treat it that way.

## What is worth reporting

The site has real access control in it, and that is where the interesting
failures live:

- **The private half of `/about`.** A way to read the withheld name, employment
  or education without a valid access code.
- **Access grants.** A way to forge, guess, extend, or reuse a revoked code, or
  to enumerate which codes exist.
- **Uploads marked private.** A way to fetch one without a grant — including
  through a cache, a derivative size, or anything that fetches on a reader's
  behalf.
- **`/admin` and `/api`.** Anything that lets a request act as the owner, read
  unpublished drafts, or write without being signed in.

## What is not

**<https://demov1.euan.im> is a demonstration, not the site.** It is a folder of
static files with no database and no server behind it, built from invented
content: the name is a placeholder, the employment history is fiction, the email
address is `@example.com`. Everything on it is meant to be readable — the privacy
masking there is a switch you can turn on to see how it looks, which the page
says plainly. "The private content is visible on demov1" is the demonstration
working, not a vulnerability.

Also out of scope: missing security headers on the preview (GitHub Pages does not
take headers from this repository), automated scanner output with no demonstrated
impact, and anything that requires the owner's own admin session to already be
compromised.

## Dependencies

Known advisories in the dependency tree are tracked with `npm audit` and
Dependabot. If you have found one that is *reachable in this application* rather
than present in the tree, that is worth a report — the difference matters, and
the reachability argument is the useful part.
