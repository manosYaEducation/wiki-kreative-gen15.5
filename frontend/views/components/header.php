    <header class="header">
        <nav>
            
            <div class="nav-left">
                <a href="<?php echo (strpos($_SERVER['REQUEST_URI'], '/wiki-kreative-gen15.5/') !== false)
                    ? '/wiki-kreative-gen15.5/frontend/'
                    : '/frontend/'; ?>">
                    <img src="../assets/img/kreativenofondo.png" alt="Icono" class="icon">
                </a>
                <h1>Bienvenidas/os a la Wiki Kreative</h1>
                
            </div>
            <!--
            <div class="navbar" class="back-button">
                <ul class="headernav">
                    <li><a class="button-53" href="../frontend/ordenes-servicios.html">Ordenes Servicios</a></li>
                    <li><a class="button-53" href="../frontend/proyectos-admin.html">Proyectos</a></li>
                    <li><a class="button-53" href="../frontend/index-admin.html">Panel de Administración</a></li>
                </ul>
            </div>
            -->
            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
        <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
    </header>