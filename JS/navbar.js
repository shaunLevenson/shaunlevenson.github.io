function getBasePath(pathname) {
    const segments = pathname.split("/").filter(Boolean);
    const fileName = segments[segments.length - 1] || "";
    const directories = fileName.endsWith(".html") ? segments.slice(0, -1) : segments;

    return directories.length > 0 ? "../".repeat(directories.length) : "";
}

async function loadNavbar(basePath) {
    const navbarUrl = `${basePath}Components/navbar.html`;
    const response = await fetch(navbarUrl);

    if (!response.ok) {
        throw new Error(`Failed to load navbar: ${response.status}`);
    }

    return response.text();
}

function initializeNavbar() {
    const navbar = document.getElementById("navbar");

    if (!navbar) {
        console.warn("Navbar container not found.");
        return;
    }

    const initialBasePath = getBasePath(window.location.pathname);
    const candidatePaths = [];

    for (let path = initialBasePath; ; path = path.slice(0, -3)) {
        candidatePaths.push(path);
        if (!path) {
            break;
        }
    }

    (async () => {
        let html;
        let basePath;

        for (const candidatePath of candidatePaths) {
            try {
                html = await loadNavbar(candidatePath);
                basePath = candidatePath;
                break;
            } catch (error) {
                if (candidatePath === candidatePaths[candidatePaths.length - 1]) {
                    throw error;
                }
            }
        }

        navbar.innerHTML = html;

        navbar.querySelectorAll("[data-nav-route]").forEach(link => {
            const route = link.getAttribute("data-nav-route");

            if (route) {
                link.href = `${basePath}${route}`;
            }
        });

        const projectsLink = navbar.querySelector('#projects-link');
        const dropdown = projectsLink?.closest('.dropdown');
        if (projectsLink && dropdown) {
            projectsLink.addEventListener('click', () => {
                const expanded = projectsLink.getAttribute('aria-expanded') === 'true';
                projectsLink.setAttribute('aria-expanded', String(!expanded));
            });
        }
    })().catch(error => {
        console.error("Navbar load failed:", error);
    });
}

document.addEventListener("DOMContentLoaded", initializeNavbar);