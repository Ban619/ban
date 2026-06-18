Refactor notes

This project was reorganized to improve maintainability.

Key changes made by the assistant:

- Created `src/styles/`, `src/hooks/`, and `src/assets/` directories.
- Moved `legacy-style.css` into `src/styles/legacy.css` and imported it via `src/main.jsx`.
- Added linting/format/test scripts to `package.json` and baseline configs: `.eslintrc.cjs`, `.prettierrc`, `vitest.config.js`.

Next steps (manual):

- Run `npm install` in `client/` to install added devDependencies.
- Run `npm run dev` to start the app and perform interactive QA.
- Optionally move more CSS and assets into `src/styles` and `src/assets` and update imports.
