<header class="header">
    <nav class="navbar-main">

        <!-- IZQUIERDA: Logo + Título -->
        <div class="nav-left">
            <a href="<?php echo (strpos($_SERVER['REQUEST_URI'], '/wiki-kreative-gen15.5/') !== false)
                ? '/wiki-kreative-gen15.5/frontend/'
                : '/frontend/'; ?>">
                <img src="<?php echo (strpos($_SERVER['REQUEST_URI'], '/wiki-kreative-gen15.5/') !== false) ? '/wiki-kreative-gen15.5/assets/img/kreativenofondo.png' : '/assets/img/kreativenofondo.png'; ?>" alt="Kreative" class="icon">
            </a>
            <span class="nav-title">Bienvenidas/os a la Wiki Kreative</span>
        </div>

        <!-- CENTRO: Links principales + Buscador -->
        <div class="nav-center">
            <a href="<?php echo (strpos($_SERVER['REQUEST_URI'], '/wiki-kreative-gen15.5/') !== false)
                ? '/wiki-kreative-gen15.5/frontend/'
                : '/frontend/'; ?>" class="nav-link">Inicio</a>
            <a href="#footer" class="nav-link">Contacto</a>

            <div class="nav-search">
                <i class="fa-solid fa-magnifying-glass nav-search-icon"></i>
                <input type="text" class="nav-search-input" placeholder="Buscar..." id="searchInput">
            </div>
        </div>

        <!-- DERECHA: Tienda + Usuario -->
        <div class="nav-right">
            <a href="enlace.php?destino=tienda" target="_blank" class="nav-store-btn">
                <i class="fa-solid fa-shop"></i>
                <span>Tienda</span>
            </a>

            <!-- Menú usuario (se llena con JS según sesión/rol) -->
            <div class="user-menu" id="userMenu">
                <!-- Estado sin sesión -->
                <a href="<?php echo (strpos($_SERVER['REQUEST_URI'], '/wiki-kreative-gen15.5/') !== false)
                    ? '/wiki-kreative-gen15.5/frontend/views/login.html'
                    : '/frontend/views/login.html'; ?>" class="nav-login-btn" id="loginBtn">
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>Iniciar Sesión</span>
                </a>

                <!-- Estado con sesión (oculto hasta que JS lo activa) -->
                <div class="user-trigger" id="userTrigger" style="display:none;" onclick="toggleUserMenu()">
                    <span class="user-role-icon" id="userRoleIcon"></span>
                    <span class="user-name" id="userNameDisplay"></span>
                    <i class="fa-solid fa-chevron-down user-chevron" id="userChevron"></i>
                </div>

                <div class="user-dropdown" id="userDropdown">
                    <!-- Se llena dinámicamente con JS -->
                </div>
            </div>

            <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
        </div>

        <!-- Hamburger para móvil -->
        <div class="hamburger" id="hamburger" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </nav>

    <!-- Menú móvil -->
    <div class="mobile-menu" id="mobileMenu">
        <a href="<?php echo (strpos($_SERVER['REQUEST_URI'], '/wiki-kreative-gen15.5/') !== false)
            ? '/wiki-kreative-gen15.5/frontend/'
            : '/frontend/'; ?>" class="mobile-link">Inicio</a>
        <a href="#footer" class="mobile-link" onclick="toggleMobileMenu()">Contacto</a>
        <a href="enlace.php?destino=tienda" target="_blank" class="mobile-link">Tienda</a>
    </div>
</header>