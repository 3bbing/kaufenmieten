<!DOCTYPE html>
<html lang="de" x-data="{ darkMode: localStorage.getItem('km-theme') === 'dark' }" x-init="$watch('darkMode', value => { document.documentElement.classList.toggle('dark', value); localStorage.setItem('km-theme', value ? 'dark' : 'light'); }); document.documentElement.classList.toggle('dark', darkMode);">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Miete vs. Kauf Rechner</title>
    <meta name="description" content="Cashflow-Parität Rechner: Mieten versus Kaufen fair vergleichen.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
                    },
                    colors: {
                        primary: '#1d4ed8',
                        accent: '#f97316'
                    }
                }
            }
        };
    </script>
    <link rel="stylesheet" href="/assets/css/tailwind.css">
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <link rel="stylesheet" href="/assets/css/app.css">
    <script defer src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script type="module" src="/assets/js/app.js"></script>
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 min-h-screen">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:left-4 focus:top-4 bg-primary text-white px-4 py-2 rounded-md shadow">Zum Inhalt springen</a>
    <header class="border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur sticky top-0 z-20">
        <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center gap-2" aria-label="Zur Startseite">
                <img src="/assets/img/logo.svg" alt="Logo" class="h-8 w-8" loading="lazy">
                <span class="font-semibold text-lg">Miete vs. Kauf</span>
            </a>
            <nav class="flex items-center gap-6" aria-label="Primärnavigation">
                <a href="/" class="text-sm font-medium hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Rechner</a>
                <a href="/about.php" class="text-sm font-medium hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">About</a>
                <button type="button"
                    class="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600 hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    @click="darkMode = !darkMode" :aria-pressed="darkMode" aria-label="Darstellung umschalten">
                    <span x-show="!darkMode" class="flex items-center gap-1"><span aria-hidden="true">🌞</span> Hell</span>
                    <span x-show="darkMode" class="flex items-center gap-1"><span aria-hidden="true">🌙</span> Dunkel</span>
                </button>
            </nav>
        </div>
    </header>
    <main id="main-content" class="max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
