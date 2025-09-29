<?php

namespace App\Frontend;

class Router
{
    private $routes;
    private $basePath;

    public function __construct(array $routes, string $basePath)
    {
        $this->routes = $routes;
        $this->basePath = $basePath;
    }

    public function dispatch()
    {
        $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        if (strpos($requestUri, $this->basePath) === 0) {
            $route = substr($requestUri, strlen($this->basePath));
        } else {
            $route = $requestUri;
        }

        $route = trim($route, '/');

        // Special handling for the default index route
        if ($route === 'index.php') {
            $route = 'index';
        }

        if (array_key_exists($route, $this->routes)) {
            // Extract query parameters for views that need them
            // For 'dashboard' route, $slug is expected
            // For 'project' route, $projectId and $dashboardSlug are expected
            $viewPath = $this->routes[$route];

            // These variables will be available in the included view file
            $slug = $_GET['slug'] ?? null;
            $projectId = $_GET['id'] ?? null;
            $dashboardSlug = $_GET['dashboardSlug'] ?? null;

            require_once $viewPath;
            return;
        }

        // Handle 404 - Page not found
        http_response_code(404);
        require_once $this->routes["not-found"];
    }
}
