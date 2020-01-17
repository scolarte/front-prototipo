(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
Dashboard = Object.assign({ }, window.Dashboard || { }, {
    Sidebar: {
        init: function($, window, document) {
            var $sidebarMenu = $('.sidebar-menu');
            var $sidebarMenuLinks = $sidebarMenu.find(
                '.sidebar-menu__entry__link,' +
                '.sidebar-submenu__entry__link'
            );
            var $triggerLink = $sidebarMenu.find(
                '.sidebar-menu__entry--nested > .sidebar-menu__entry__link,' +
                '.sidebar-submenu__entry--nested > .sidebar-submenu__entry__link'
            );

            // Set Active Items
            (function() {
                var $sidebarMenuActiveLink = $sidebarMenuLinks
                    .filter(function() {
                        return window.location.href === $(this).prop('href');
                    })
                    .first();
                    
                function applyToParent($startElement) {
                    var $parent = $startElement.parents(
                        '.sidebar-submenu__entry--nested,' +
                        '.sidebar-menu__entry--nested'
                    );

                    if ($parent.length > 0) {
                        $parent.addClass('active open');
                        applyToParent($parent);
                    }
                }

                $sidebarMenuActiveLink.parent().addClass('active');
                applyToParent($sidebarMenuActiveLink);
            })();

            // Open / Close nested
            $triggerLink.on('click', function() {
                var $parent = $(this).parent(
                    '.sidebar-menu__entry--nested,' +
                    '.sidebar-submenu__entry--nested'
                );
                $parent.toggleClass('open');
            });
        }
    }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvanMvc2lkZS1tZW51LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJEYXNoYm9hcmQgPSBPYmplY3QuYXNzaWduKHsgfSwgd2luZG93LkRhc2hib2FyZCB8fCB7IH0sIHtcbiAgICBTaWRlYmFyOiB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQpIHtcbiAgICAgICAgICAgIHZhciAkc2lkZWJhck1lbnUgPSAkKCcuc2lkZWJhci1tZW51Jyk7XG4gICAgICAgICAgICB2YXIgJHNpZGViYXJNZW51TGlua3MgPSAkc2lkZWJhck1lbnUuZmluZChcbiAgICAgICAgICAgICAgICAnLnNpZGViYXItbWVudV9fZW50cnlfX2xpbmssJyArXG4gICAgICAgICAgICAgICAgJy5zaWRlYmFyLXN1Ym1lbnVfX2VudHJ5X19saW5rJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHZhciAkdHJpZ2dlckxpbmsgPSAkc2lkZWJhck1lbnUuZmluZChcbiAgICAgICAgICAgICAgICAnLnNpZGViYXItbWVudV9fZW50cnktLW5lc3RlZCA+IC5zaWRlYmFyLW1lbnVfX2VudHJ5X19saW5rLCcgK1xuICAgICAgICAgICAgICAgICcuc2lkZWJhci1zdWJtZW51X19lbnRyeS0tbmVzdGVkID4gLnNpZGViYXItc3VibWVudV9fZW50cnlfX2xpbmsnXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBTZXQgQWN0aXZlIEl0ZW1zXG4gICAgICAgICAgICAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyICRzaWRlYmFyTWVudUFjdGl2ZUxpbmsgPSAkc2lkZWJhck1lbnVMaW5rc1xuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5ocmVmID09PSAkKHRoaXMpLnByb3AoJ2hyZWYnKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmZpcnN0KCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGFwcGx5VG9QYXJlbnQoJHN0YXJ0RWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgJHBhcmVudCA9ICRzdGFydEVsZW1lbnQucGFyZW50cyhcbiAgICAgICAgICAgICAgICAgICAgICAgICcuc2lkZWJhci1zdWJtZW51X19lbnRyeS0tbmVzdGVkLCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJy5zaWRlYmFyLW1lbnVfX2VudHJ5LS1uZXN0ZWQnXG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCRwYXJlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHBhcmVudC5hZGRDbGFzcygnYWN0aXZlIG9wZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGx5VG9QYXJlbnQoJHBhcmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkc2lkZWJhck1lbnVBY3RpdmVMaW5rLnBhcmVudCgpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICAgICBhcHBseVRvUGFyZW50KCRzaWRlYmFyTWVudUFjdGl2ZUxpbmspO1xuICAgICAgICAgICAgfSkoKTtcblxuICAgICAgICAgICAgLy8gT3BlbiAvIENsb3NlIG5lc3RlZFxuICAgICAgICAgICAgJHRyaWdnZXJMaW5rLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFyZW50ID0gJCh0aGlzKS5wYXJlbnQoXG4gICAgICAgICAgICAgICAgICAgICcuc2lkZWJhci1tZW51X19lbnRyeS0tbmVzdGVkLCcgK1xuICAgICAgICAgICAgICAgICAgICAnLnNpZGViYXItc3VibWVudV9fZW50cnktLW5lc3RlZCdcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICRwYXJlbnQudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufSk7XG4iXX0=
