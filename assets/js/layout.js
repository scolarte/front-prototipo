(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
Dashboard = Object.assign({ }, window.Dashboard || { }, {
    Layout: {
        init: function($, window, document) {
            var lastScreenSizeSmall;
            var $sidebarCollapseTrigger = $('.action--sidebar-trigger');
            var $layoutSidebar = $('.layout__sidebar');
            var $sidebar = $layoutSidebar.find('.sidebar');
            var $sidebarMenu = $('.sidebar-menu');
            var $navbar = $('.navbar');

            var storage = {
                saveSlimState: function(isSlim) {
                    if (typeof window.localStorage !== 'undefined') {
                        localStorage.setItem('isSlim', isSlim ? 'on' : 'off');
                    }
                },
                restoreSlimState: function() {
                    if (typeof window.localStorage !== 'undefined') {
                        return localStorage.getItem('isSlim') === 'on';
                    }
                    return false;
                }
            }
            var isSidebarCollapsed = function() {
                return $sidebar.hasClass('sidebar--collapsed');
            }
            var isMobile = function() {
                return !!window.matchMedia('(max-width: 991px)').matches;
            }
            var toggleSidebar = function(enabled) {
                var toggleVal = typeof enabled === 'undefined' ? !isSidebarCollapsed() : !enabled;
                if (isMobile()) {
                    // Mobile Overlay on Mobile
                    $sidebar.toggleClass('sidebar--collapsed', toggleVal);
                    $sidebar.removeClass('sidebar--slim');
                } else {
                    // Slim on Desktop
                    $sidebar.addClass('sidebar--slim');

                    $sidebar.toggleClass('sidebar--collapsed', toggleVal);
                    $layoutSidebar.toggleClass('layout__sidebar--slim', toggleVal);
                    $sidebarMenu.toggleClass('sidebar-menu--slim', toggleVal);
                }
                return toggleVal;
            }
            
            // Sidebar show/hide trigger handler
            $sidebarCollapseTrigger.on('click', function(e) {
                e.stopImmediatePropagation();
                var sidebarOpen = toggleSidebar();
                if (!isMobile()) {
                    storage.saveSlimState(sidebarOpen);
                }
            });

            // On screen resize - show or hide sidebar
            $(window).on('resize', function() {
                var currentScreenSmall = isMobile();
                if (currentScreenSmall !== lastScreenSizeSmall) {
                    if (currentScreenSmall) {
                        toggleSidebar(false);
                    } else {
                        var slim = storage.restoreSlimState();
                        toggleSidebar(!slim);
                    }
                    lastScreenSizeSmall = currentScreenSmall;
                }
            });

            // On click outside of the sidebar
            $(document).on('click', function(e) {
                if (
                    isMobile() &&
                    $layoutSidebar.length > 0 &&
                    e.target !== $layoutSidebar[0] &&
                    !$layoutSidebar[0].contains(e.target) &&
                    !isSidebarCollapsed()
                ) {
                    toggleSidebar(false);
                }
            });

            // Hide Collapse when Navbar dropdown is activated
            $navbar.on('show.bs.dropdown', function(e) {
                // Only on uncollapsable dropdowns!
                if ($(e.target).closest('.navbar-collapse').length === 0) {
                    $navbar.find('.navbar-collapse').collapse('hide');
                }
            });

            // Init
            if (isMobile()) {
                toggleSidebar(false);
            } else {
                var slim = storage.restoreSlimState();
                toggleSidebar(!slim);
            }
        }
    }
})
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvbGF5b3V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJEYXNoYm9hcmQgPSBPYmplY3QuYXNzaWduKHsgfSwgd2luZG93LkRhc2hib2FyZCB8fCB7IH0sIHtcclxuICAgIExheW91dDoge1xyXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyIGxhc3RTY3JlZW5TaXplU21hbGw7XHJcbiAgICAgICAgICAgIHZhciAkc2lkZWJhckNvbGxhcHNlVHJpZ2dlciA9ICQoJy5hY3Rpb24tLXNpZGViYXItdHJpZ2dlcicpO1xyXG4gICAgICAgICAgICB2YXIgJGxheW91dFNpZGViYXIgPSAkKCcubGF5b3V0X19zaWRlYmFyJyk7XHJcbiAgICAgICAgICAgIHZhciAkc2lkZWJhciA9ICRsYXlvdXRTaWRlYmFyLmZpbmQoJy5zaWRlYmFyJyk7XHJcbiAgICAgICAgICAgIHZhciAkc2lkZWJhck1lbnUgPSAkKCcuc2lkZWJhci1tZW51Jyk7XHJcbiAgICAgICAgICAgIHZhciAkbmF2YmFyID0gJCgnLm5hdmJhcicpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHN0b3JhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICBzYXZlU2xpbVN0YXRlOiBmdW5jdGlvbihpc1NsaW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5sb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpc1NsaW0nLCBpc1NsaW0gPyAnb24nIDogJ29mZicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICByZXN0b3JlU2xpbVN0YXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdy5sb2NhbFN0b3JhZ2UgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaXNTbGltJykgPT09ICdvbic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaXNTaWRlYmFyQ29sbGFwc2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJHNpZGViYXIuaGFzQ2xhc3MoJ3NpZGViYXItLWNvbGxhcHNlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBpc01vYmlsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICEhd2luZG93Lm1hdGNoTWVkaWEoJyhtYXgtd2lkdGg6IDk5MXB4KScpLm1hdGNoZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHRvZ2dsZVNpZGViYXIgPSBmdW5jdGlvbihlbmFibGVkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9nZ2xlVmFsID0gdHlwZW9mIGVuYWJsZWQgPT09ICd1bmRlZmluZWQnID8gIWlzU2lkZWJhckNvbGxhcHNlZCgpIDogIWVuYWJsZWQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNNb2JpbGUoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1vYmlsZSBPdmVybGF5IG9uIE1vYmlsZVxyXG4gICAgICAgICAgICAgICAgICAgICRzaWRlYmFyLnRvZ2dsZUNsYXNzKCdzaWRlYmFyLS1jb2xsYXBzZWQnLCB0b2dnbGVWYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzaWRlYmFyLnJlbW92ZUNsYXNzKCdzaWRlYmFyLS1zbGltJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNsaW0gb24gRGVza3RvcFxyXG4gICAgICAgICAgICAgICAgICAgICRzaWRlYmFyLmFkZENsYXNzKCdzaWRlYmFyLS1zbGltJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICRzaWRlYmFyLnRvZ2dsZUNsYXNzKCdzaWRlYmFyLS1jb2xsYXBzZWQnLCB0b2dnbGVWYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICRsYXlvdXRTaWRlYmFyLnRvZ2dsZUNsYXNzKCdsYXlvdXRfX3NpZGViYXItLXNsaW0nLCB0b2dnbGVWYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICRzaWRlYmFyTWVudS50b2dnbGVDbGFzcygnc2lkZWJhci1tZW51LS1zbGltJywgdG9nZ2xlVmFsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0b2dnbGVWYWw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIFNpZGViYXIgc2hvdy9oaWRlIHRyaWdnZXIgaGFuZGxlclxyXG4gICAgICAgICAgICAkc2lkZWJhckNvbGxhcHNlVHJpZ2dlci5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNpZGViYXJPcGVuID0gdG9nZ2xlU2lkZWJhcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RvcmFnZS5zYXZlU2xpbVN0YXRlKHNpZGViYXJPcGVuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBPbiBzY3JlZW4gcmVzaXplIC0gc2hvdyBvciBoaWRlIHNpZGViYXJcclxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50U2NyZWVuU21hbGwgPSBpc01vYmlsZSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRTY3JlZW5TbWFsbCAhPT0gbGFzdFNjcmVlblNpemVTbWFsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U2NyZWVuU21hbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlU2lkZWJhcihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNsaW0gPSBzdG9yYWdlLnJlc3RvcmVTbGltU3RhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlU2lkZWJhcighc2xpbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTY3JlZW5TaXplU21hbGwgPSBjdXJyZW50U2NyZWVuU21hbGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgLy8gT24gY2xpY2sgb3V0c2lkZSBvZiB0aGUgc2lkZWJhclxyXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgICAgICAgICAgaXNNb2JpbGUoKSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICRsYXlvdXRTaWRlYmFyLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICAgICAgICAgICAgICBlLnRhcmdldCAhPT0gJGxheW91dFNpZGViYXJbMF0gJiZcclxuICAgICAgICAgICAgICAgICAgICAhJGxheW91dFNpZGViYXJbMF0uY29udGFpbnMoZS50YXJnZXQpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgIWlzU2lkZWJhckNvbGxhcHNlZCgpXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVTaWRlYmFyKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBIaWRlIENvbGxhcHNlIHdoZW4gTmF2YmFyIGRyb3Bkb3duIGlzIGFjdGl2YXRlZFxyXG4gICAgICAgICAgICAkbmF2YmFyLm9uKCdzaG93LmJzLmRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gT25seSBvbiB1bmNvbGxhcHNhYmxlIGRyb3Bkb3ducyFcclxuICAgICAgICAgICAgICAgIGlmICgkKGUudGFyZ2V0KS5jbG9zZXN0KCcubmF2YmFyLWNvbGxhcHNlJykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJG5hdmJhci5maW5kKCcubmF2YmFyLWNvbGxhcHNlJykuY29sbGFwc2UoJ2hpZGUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAvLyBJbml0XHJcbiAgICAgICAgICAgIGlmIChpc01vYmlsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTaWRlYmFyKGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHZhciBzbGltID0gc3RvcmFnZS5yZXN0b3JlU2xpbVN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVTaWRlYmFyKCFzbGltKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSkiXX0=
