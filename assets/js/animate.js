(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Default import fix
var anime = require('animejs').default ?
    require('animejs').default : require('animejs');
var utils = require('./utilities');

function DropdownMenuAnimate(config) {
    this.dropdownMenus = [];
    this.dropdownMenuObserver = null;
    this.config = Object.assign({}, {
        animationDuration: 300,
        animationStepOffset: 0.1,
        translationDelta: 10,
        initialScale: 0.8,
        animeEasing: 'easeOutElastic(1.5, 0.8)',
    }, config);
}

function placementToTransformOrigin(placement) {
    var placementParts = (placement || '').split('-');
    if (placementParts.length === 2) {
        var placementA = placementParts[0];
        var placementB = placementParts[1];
        var xOrigin = 'center';
        var yOrigin = 'center';

        // Horizontal
        if (placementA === 'top' || placementA === 'bottom') {
            // Inversion is needed
            yOrigin = placementA === 'top' ? 'bottom' : 'top';
            xOrigin = placementB === 'start' ? 'left' : 'right';
        }

        //Vertical
        if (placementA === 'left' || placementA === 'right') {
            // Inversion is needed
            xOrigin = placementA === 'left' ? 'right' : 'left';
            yOrigin = placementB === 'start' ? 'top' : 'bottom';
        }

        return xOrigin + ' ' + yOrigin;
    }
    return 'center center';
}

function originToTranslate(origin, delta) {
    var originParts = (origin || '').split(' ');
    if (originParts.length === 2) {
        var xOrigin = originParts[0];
        var yOrigin = originParts[1];
        var startXTransform = 0;
        var startYTransform = 0;

        if (xOrigin === 'left') {
            startXTransform = -delta;
        }
        if (xOrigin === 'right') {
            startXTransform = delta;
        }
        if (yOrigin === 'top') {
            startYTransform = -delta;
        }
        if (yOrigin === 'bottom') {
            startYTransform = delta;
        }

        return {
            transformX: [startXTransform, 0],
            transformY: [startYTransform, 0]
        };
    }

    return {
        transformX: [0, 0],
        transformY: [0, 0]
    };
}

DropdownMenuAnimate.prototype.initializeWatcher = function(dropdownMenus) {
    var _this = this;

    this.dropdownMenus = NodeList.prototype.isPrototypeOf(dropdownMenus) ?
        Array.from(dropdownMenus) : [dropdownMenus];

    this.dropdownMenuObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var prevShow = mutation.oldValue.indexOf('show') >= 0;
            var currentShow = mutation.target.classList.contains('show');

            if (!prevShow && currentShow) {
                _this.animateIn(mutation.target, mutation.target.parentElement);
            }
        });
    });

    this.dropdownMenus.forEach(function(dropdownMenu) {
        if (dropdownMenu) {
            _this.dropdownMenuObserver.observe(dropdownMenu, {
                attributes: true,
                attributeFilter: ['class'],
                attributeOldValue: true,
            });
        }
    });
};

DropdownMenuAnimate.prototype.destroyWatcher = function() {
    if (this.dropdownMenuObserver) {
        this.dropdownMenuObserver.disconnect();
    }
};

DropdownMenuAnimate.prototype.animateIn = function(menuElement, parentElement) {
    if (!utils.isElementInCollapsedNavbar(parentElement)) {
        // Deterimine placement by Popper attribute
        var popperPlacement = menuElement.attributes['x-placement'] &&
            menuElement.attributes['x-placement'].nodeValue;
        // Deterimne placement by classes on elements
        var classPlacement =
            (parentElement.classList.contains('dropup') ? 'top' : 'bottom') + '-' +
            (menuElement.classList.contains('dropdown-menu-right') ? 'end' : 'start');
        // Deterimne the final placement - Popper priority
        var placement = popperPlacement || classPlacement;
        // Generate a Transform Origin
        var transformOrigin = placementToTransformOrigin(placement);
        // Generate target translation based on Transform Origin
        var targetTranslations = originToTranslate(
            transformOrigin,
            this.config.translationDelta
        );

        var timeline = anime.timeline({
            targets: menuElement,
            duration: this.config.animationDuration,
            begin: function() {
                menuElement.style.transformOrigin = transformOrigin;
            },
        }).add({
            opacity: [0, 1],
            easing: 'easeOutCubic',
        }).add(
            Object.assign({}, {
                scale: [this.config.initialScale, 1],
                easing: this.config.animeEasing,
            }, targetTranslations),
            this.config.animationDuration * this.config.animationStepOffset
        );
    }
};

DropdownMenuAnimate.prototype._animateOut = function(menuElement) {
};

module.exports = DropdownMenuAnimate;
},{"./utilities":7,"animejs":9}],2:[function(require,module,exports){
// Default import fix
var anime = require('animejs').default ?
    require('animejs').default : require('animejs');
var utils = require('./utilities');

function NestedDropdownAnimate(config) {
    this.config = Object.assign({}, {
        animationDuration: 150,
        animationStepOffset: 0.1,
        translationDelta: 10,
        initialScale: 0.8,
        animeEasing: 'easeOutElastic(1.5, 0.8)',
    }, config);
    this.boundExecuteAnimation =
        this._executeAnimation.bind(this);
}

NestedDropdownAnimate.prototype.initialize = function(dropdownParents) {
    var _this = this;

    var nestedDropdowns = NodeList.prototype.isPrototypeOf(dropdownParents) ?
        Array.from(dropdownParents) : [dropdownParents];
    this.dropdownSubmenuLinks = nestedDropdowns
        .map(function(dropdown) {
            return Array.from(
                dropdown.querySelectorAll('.nested-dropdown__submenu-item__link')
            );
        })
        .reduce(function(acc, linkElements) {
            return acc.concat(linkElements);
        }, []);
    
    this.dropdownSubmenuLinks.forEach(function(dropdownSubmenuLink) {
        dropdownSubmenuLink.addEventListener('mouseenter', _this.boundExecuteAnimation);
    });
};

NestedDropdownAnimate.prototype.destroy = function() {
    this.dropdownSubmenuLinks.removeEventListener('mouseenter', this.boundExecuteAnimation);
};

NestedDropdownAnimate.prototype._executeAnimation = function(event) {
    // Animate only in uncollapsed dropdowns
    if (!utils.isElementInCollapsedNavbar(event.currentTarget)) {
        var menuElement = event.currentTarget.nextElementSibling;
        var timeline = anime.timeline({
            targets: menuElement,
            duration: this.config.animationDuration,
            begin: function() {
                menuElement.style.transformOrigin = 'left-top';
            },
        }).add({
            opacity: [0, 1],
            easing: 'easeOutCubic',
        }).add({
            scale: [this.config.initialScale, 1],
            easing: this.config.animeEasing,
            translateX: [-this.config.translationDelta, 0],
            translateY: [-this.config.translationDelta, 0],
        }, this.config.animationDuration * this.config.animationStepOffset);
    }
};

module.exports = NestedDropdownAnimate;
},{"./utilities":7,"animejs":9}],3:[function(require,module,exports){
// Default import fix
var anime = require('animejs').default ?
    require('animejs').default : require('animejs');

function SideMenuAnimate(config) {
    var activeAnimation;

    var option = Object.assign(
        { },
        {
            easing: 'easeInOutCubic',
            duration: 300,
        },
        config
    );
    
    this._nodesObserver = new MutationObserver(function (mutations) {
        var changedNodes = mutations
            .filter(function (mutation) {
                return (
                    mutation.target.classList.contains('sidebar-menu__entry--nested') ||
                    mutation.target.classList.contains('sidebar-submenu__entry--nested')
                );
            })
            .map(function (mutation) {
                return { 
                    target: mutation.target,
                    wasOpen: mutation.oldValue.indexOf('open') >= 0,
                };
            });

        changedNodes.forEach(function (node) {
            var isOpen = node.target.classList.contains('open');

            if (isOpen !== node.wasOpen) {
                var menu = node.target.querySelector('.sidebar-submenu');

                if (activeAnimation && !activeAnimation.completed) {
                    activeAnimation.reset();
                }

                activeAnimation = anime({
                    targets: menu,
                    height: isOpen ?
                        [0, menu.scrollHeight] :
                        [menu.scrollHeight, 0],
                    duration: option.duration,
                    easing: option.easing
                });
                activeAnimation.finished.then(function() {
                    menu.style.height = '';
                });
            }            
        });
    });
}

/**
 * Assigns the parent sidebar element, and attaches a Mutation Observer
 * which watches the coallapsable nodes inside of the sidebar menu
 * and animates them on chenages
 * 
 * @param {HTMLElement} parentElement SidebarMenu parent
 */
SideMenuAnimate.prototype.assignParentElement = function (parentElement) {
    // Reassign Observer Element
    this._nodesObserver.disconnect();
    this._nodesObserver.observe(parentElement, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true,
        subtree: true
    });
};

/**
 * Disconnects the observer
 */
SideMenuAnimate.prototype.destroy = function() {
    this._nodesObserver.disconnect();
};

/**
 * Disconnects the observer
 */
SideMenuAnimate.prototype.destroy = function() {
    this._nodesObserver.disconnect();
}

module.exports = SideMenuAnimate;

},{"animejs":9}],4:[function(require,module,exports){
// Default import fix
var anime = require('animejs').default ?
    require('animejs').default : require('animejs');

function SidebarEntryAnimate(options) {
    // Flag to ensure the animation is fired only once
    this.wasAnimated = false;
    this.sidebarElement = null;
    this.config = Object.assign({}, {
        duration: 100,
        easing: 'linear'
    }, options);
}

SidebarEntryAnimate.prototype.executeAnimation = function() {
    var config = this.config;

    var sidebarElement = this.sidebarElement;

    if (!this.wasAnimated && sidebarElement) {
        var isSlim = (
            sidebarElement.classList.contains('sidebar--slim') &&
            sidebarElement.classList.contains('sidebar--collapsed')
        );
        var sidebarMenu = sidebarElement.querySelector(
            '.sidebar-menu'
        );

        var sidebarSectionsPreMenu = [];
        var sidebarMenuSection = null;
        var sideMenuEntries = [];
        var sidebarSectionsPostMenu = [];

        sidebarElement.querySelectorAll('.sidebar__section')
            .forEach(function(sectionElement) {
                // Ommit sections which arent visible
                if (
                    (
                        isSlim &&
                        sectionElement.classList.contains('sidebar__hide-slim')
                    ) || (
                        !isSlim &&
                        sectionElement.classList.contains('sidebar__show-slim')
                    )
                ) {
                    return;
                }

                if (sectionElement.contains(sidebarMenu)) {
                    sidebarMenuSection = sectionElement;
                    // Add sidemenu entries
                    var sidebarMenuEntriesNodes =
                        sectionElement.querySelectorAll(
                            '.sidebar-menu > .sidebar-menu__entry'
                        );
                    sideMenuEntries = sideMenuEntries.concat(
                        Array.from(sidebarMenuEntriesNodes)
                    );
                } else {
                    if (sideMenuEntries.length > 0) {
                        // Add post menu sections
                        sidebarSectionsPostMenu
                            .push(sectionElement);
                    } else {
                        // Add pre menu sections
                        sidebarSectionsPreMenu
                            .push(sectionElement);
                    }
                }
            });

        var timeline = anime.timeline({
            easing: config.easing,
            duration: config.duration,
            complete: function() {
                // Clear section styles
                [].concat(
                    sidebarSectionsPreMenu,
                    sideMenuEntries,
                    sidebarSectionsPostMenu
                ).forEach(function(element) {
                    element.style.opacity = '';
                });
            }
        });
        var staggerDelay =
            config.duration / (
                sidebarSectionsPreMenu.length +
                sidebarSectionsPostMenu. length
            ) / sideMenuEntries.length;
        timeline
            .add({
                targets: sidebarSectionsPreMenu,
                delay: anime.stagger(staggerDelay),
                opacity: [0, 1]
            })
            .add({
                targets: sideMenuEntries,
                delay: anime.stagger(staggerDelay),
                begin: function() {
                    sidebarMenuSection.style.opacity = 1;
                },
                opacity: [0, 1]
            })
            .add({
                targets: sidebarSectionsPostMenu,
                delay: anime.stagger(staggerDelay),
                opacity: [0, 1]
            });

        this.wasAnimated = true;

        return timeline.finished;
    }

    return Promise.resolve();
};

/**
 * Assigns the parent sidebar element, and attaches a Mutation Observer
 * which watches the coallapsable nodes inside of the sidebar menu
 * and animates them on chenages
 * 
 * @param {HTMLElement} parentElement SidebarMenu parent
 */
SidebarEntryAnimate.prototype.assignParentElement = function (parentElement) {
    this.sidebarElement = parentElement;
};

/**
 * Disconnects the observer
 */
SidebarEntryAnimate.prototype.destroy = function() { };

module.exports = SidebarEntryAnimate;
},{"animejs":9}],5:[function(require,module,exports){
// Default import fix
var anime = require('animejs').default ?
    require('animejs').default : require('animejs');

var ANIMATION_DURATION = 150;
var ANIMATION_STEP_OFFSET = 0.1;

function SlimMenuAnimate(config) {
    var _this = this;

    this.mouseInHandler = function() {
        if (_this._animationsEnabled()) {
            var triggerElement = this;
            var subMenuElement = triggerElement.querySelector(':scope > .sidebar-submenu');
            
            var timeline = anime.timeline({
                targets: subMenuElement,
                duration: ANIMATION_DURATION,
                begin: function() {
                    subMenuElement.style.transformOrigin = 'top left';
                }
            }).add({
                opacity: [0, 1],
                easing: 'easeOutCubic',
            }).add({
                scale: [0.8, 1],
                translateY: [-30, 0],
                translateX: [-30, 0],
                easing: 'easeOutElastic(1.5, 0.8)',
            }, ANIMATION_DURATION * ANIMATION_STEP_OFFSET);

            // Reset Style on Finish
            timeline.finished.then(function() {
                subMenuElement.style.opacity = '';
                subMenuElement.style.transform = '';
                subMenuElement.style.transformOrigin = '';
            });
        }
    };
    this.mouseOutHandler = function() {
        if (_this._animationsEnabled()) {
            var triggerElement = this;
            var subMenuElement = triggerElement.querySelector(':scope > .sidebar-submenu');
            return;
            var timeline = anime.timeline({
                targets: subMenuElement,
                duration: ANIMATION_DURATION,
                begin: function() {
                    subMenuElement.style.display = 'block';
                    subMenuElement.style.height = 'auto';
                    subMenuElement.style.transformOrigin = 'top left';
                }
            }).add({
                scale: [1, 0.8],
                translateY: [0, -30],
                translateX: [0, -30],
                easing: 'easeOutElastic(1.5, 0.8)',
            }).add({
                opacity: [1, 0],
                easing: 'easeOutCubic',
            }, ANIMATION_DURATION * ANIMATION_STEP_OFFSET);

            // Reset Style on Finish
            timeline.finished.then(function() {
                subMenuElement.style.opacity = '';
                subMenuElement.style.transform = '';
                subMenuElement.style.transformOrigin = '';
                subMenuElement.style.display = '';
                subMenuElement.style.height = '';
            });
        }
    };
}

SlimMenuAnimate.prototype._animationsEnabled = function() {
    return this._sidebarElement.classList.contains('sidebar--animations-enabled') &&
            this._sidebarElement.classList.contains('sidebar--slim') &&
            this._sidebarElement.classList.contains('sidebar--collapsed');
};

/**
 * Assigns the parent sidebar element, and attaches hover listeners
 * 
 * @param {HTMLElement} parentElement SidebarMenu parent
 */
SlimMenuAnimate.prototype.assignSidebarElement = function (sidebarElement) {
    var _this = this;
    _this._sidebarElement = sidebarElement;
    _this._triggerElements = Array.from(
        _this._sidebarElement.querySelectorAll(
            '.sidebar-menu .sidebar-menu__entry.sidebar-menu__entry--nested'
        )
    );
    _this._triggerElements.forEach(function (triggerElement) {
        triggerElement.addEventListener('mouseenter', _this.mouseInHandler);
        triggerElement.addEventListener('mouseleave', _this.mouseOutHandler);
    });
};

/**
 * Disconnects the listeners
 */
SlimMenuAnimate.prototype.destroy = function() {
    var _this = this;
    _this._triggerElements.forEach(function (triggerElement) {
        triggerElement.removeEventListener('mouseenter', _this.mouseInHandler);
        triggerElement.removeEventListener('mouseleave', _this.mouseOutHandler);
    });
};

module.exports = SlimMenuAnimate;

},{"animejs":9}],6:[function(require,module,exports){
var anime = require('animejs').default ? require('animejs').default : require('animejs');

function SlimSidebarAnimate(options) {
    var timelineStage1,
        timelineStage2;
    var isAnimating = false;
    var config = Object.assign({}, {
        sidebarWidth: 250,
        sidebarSlimWidth: 60,
        animationDuration: 400,
        animationStaggerDelay: 10,
        animationEasing: 'easeInQuad'        
    }, options);

    function buildTimeline(beginCallback) {
        return anime.timeline({
            easing: config.animationEasing,
            duration: config.animationDuration / 2,
            autoplay: false,
            begin: beginCallback || function() { }
        });
    }

    this._nodesObserver = new MutationObserver(function (mutations) {
        var mutation = mutations[0];
        var animationHalfTime = config.animationDuration / 2;
        var sidebarElement = mutation.target;
        var layoutSidebarWrap = sidebarElement.closest('.layout__sidebar');
        var sidebarMenu = sidebarElement.querySelector('.sidebar-menu');
        var sidebarLabels = document.querySelectorAll(
            '.sidebar-menu__entry__link > span, ' +
            '.sidebar-submenu__entry__link > span'
        );
        var sidebarIcons = document.querySelectorAll('.sidebar-menu__entry__icon');
        var sidebarHideSlim = document.querySelectorAll('.sidebar__hide-slim');
        var sidebarShowSlim = document.querySelectorAll('.sidebar__show-slim');

        var isSidebarSlim = sidebarElement.classList.contains('sidebar--slim');
        var isSidebarCollapsed = sidebarElement.classList.contains('sidebar--collapsed');
        var lastSidebarSlim = mutation.oldValue.indexOf('sidebar--slim') >= 0;
        var lastSidebarCollapsed = mutation.oldValue.indexOf('sidebar--collapsed') >= 0;
        
        // Finish previous animations if they exist
        if (timelineStage1 && timelineStage1.isAnimating) { timelineStage1.complete(); }
        if (timelineStage2 && timelineStage2.isAnimating) { timelineStage2.complete(); }

        if (
            (isSidebarSlim || lastSidebarSlim) &&
            (isSidebarCollapsed !== lastSidebarCollapsed) &&
            !isAnimating
        ) {
            isAnimating = true;

            if (isSidebarCollapsed) {
                // Recover the changed class so the animation
                // can be played smoothly
                sidebarElement.classList.remove('sidebar--collapsed');
                // STAGE 1: Hide Default
                timelineStage1 = buildTimeline()
                    .add({
                        // Move the sidebar off screen and leave only the "slim" part
                        targets: sidebarElement,
                        translateX: -(config.sidebarWidth - config.sidebarSlimWidth),
                        begin: function() {
                            // This class hides ::after carets and fades
                            // the active highlight
                            sidebarElement.classList.add('sidebar--animate-slim--progress');
                        }
                    })
                    .add({
                        // Hide the menu entries titles
                        targets: sidebarLabels,
                        opacity: 0,
                        complete: function() {
                            // Reset the style of titles upon completion
                            sidebarLabels.forEach(function(label) { label.removeAttribute('style'); });
                        },
                    }, 0)
                    .add({
                        // Hide sections which are visible in default sidebar
                        targets: sidebarHideSlim,
                        opacity: 0
                    }, 0);
                // STAGE 2: Show Slim
                timelineStage2 = buildTimeline()
                    .add({
                        // Create a fade-in and entry from left of slim icons
                        targets: sidebarIcons,
                        opacity: [0, 1],
                        translateX: [-config.sidebarSlimWidth, 0],
                        delay: anime.stagger(config.animationStaggerDelay),
                        begin: function() {
                            // First animation stage complete, make the sidebar trully slim
                            sidebarElement.classList.add('sidebar--collapsed');
                            sidebarElement.classList.remove('sidebar--animate-slim--progress');
                            // Reset sidebar style after the first stage
                            sidebarElement.removeAttribute('style');
                            // Reset Hidden elements styles
                            sidebarHideSlim.forEach(function(element) { element.removeAttribute('style'); });
                        },
                        complete: function() {
                            // Reset icons styles
                            sidebarIcons.forEach(function(icon) { icon.removeAttribute('style'); });
                        },
                    })
                    .add({
                        // Fade in section visible only in slim sidebar
                        targets: sidebarShowSlim,
                        opacity: [0, 1],
                        complete: function() {
                            sidebarShowSlim.forEach(function(element) { element.removeAttribute('style'); });
                        }
                    }, 0);
                // START: Chain both timelines
                timelineStage1.finished.then(function() {
                    timelineStage2.play();
                });
                timelineStage2.finished.then(function() {
                    isAnimating = false;
                    // Reset styles of modified sections
                    sidebarElement.querySelectorAll('.sidebar__section')
                        .forEach(function(section) { section.removeAttribute('style'); });
                    sidebarElement.classList.remove();
                });
                timelineStage1.play();
            } else {
                // Recover the slim classes so the animation can make
                // the smooth transition
                sidebarElement.classList.add('sidebar--collapsed');
                sidebarMenu.classList.add('sidebar-menu--slim');
                layoutSidebarWrap.classList.add('layout__sidebar--slim');
                // Setup the animation class
                sidebarElement.classList.add('sidebar--animate-slim--progress');
                // STAGE 1: Hide Slim
                timelineStage1 = buildTimeline()
                    .add({
                        // Hide the slim icons to the left of the screen and fade them out
                        targets: sidebarIcons,
                        translateX: -config.sidebarSlimWidth,
                        duration: animationHalfTime,
                        delay: anime.stagger(config.animationStaggerDelay),
                        opacity: 0,
                    })
                    .add({
                        // Hide the sections visible only in slim
                        targets: sidebarShowSlim,
                        duration: animationHalfTime,
                        opacity: [1, 0],
                    }, 0);

                // STAGE 2: Show Slim
                timelineStage2 = buildTimeline()
                    // HACK: Setup step - translateX 0 is set for initial transform value
                    // animejs sets the translate by the first step in timeline
                    // which works wrong with remmoving the collapse clases. In other
                    // words: Don't touch this!
                    .add({
                        targets: sidebarElement,
                        duration: 1,
                        translateX: [0, 0],
                        complete: function() {
                            // Reset
                            sidebarIcons.forEach(function(icon) { icon.removeAttribute('style'); });
                            sidebarShowSlim.forEach(function(icon) { icon.removeAttribute('style'); });

                            // Hide Labels
                            sidebarLabels.forEach(function(label) { label.style.opacity = 0; });
                            
                            // Make the sidebar default
                            sidebarElement.classList.remove('sidebar--collapsed');
                            sidebarMenu.classList.remove('sidebar-menu--slim');
                            // Remove the animation classes
                            sidebarElement.classList.remove('sidebar--animate-slim--progress');
                        }
                    })
                    .add({
                        // Slide the sidebar back to default position
                        targets: sidebarElement,
                        duration: animationHalfTime,
                        complete: function() {
                            // Reset sidebar styles
                            sidebarElement.removeAttribute('style');
                        },
                        translateX: [-(config.sidebarWidth - config.sidebarSlimWidth), 0],
                    })
                    .add({
                        // Fade in the SideMenu entries titles
                        targets: sidebarLabels,
                        duration: animationHalfTime,
                        opacity: [0, 1],
                        complete: function() {
                            sidebarLabels.forEach(function(label) { label.removeAttribute('style'); });
                        },
                    }, 0)
                    .add({
                        // Fade in sections which are visible only in default sidebar
                        targets: sidebarHideSlim,
                        duration: animationHalfTime,
                        opacity: [0, 1],
                        complete: function() {
                            sidebarHideSlim.forEach(function(label) { label.removeAttribute('style'); });
                        }
                    }, 0);
                // START: Chain both timelines
                timelineStage1.finished.then(function() {
                    requestAnimationFrame(function() {
                        timelineStage2.play();
                    });
                    
                });
                timelineStage2.finished.then(function() {
                    isAnimating = false;
                    // Reset styles of modified sections
                    sidebarElement.querySelectorAll('.sidebar__section')
                        .forEach(function(section) { section.removeAttribute('style'); });

                    // Recover the layout__sidebar state
                    layoutSidebarWrap.classList.remove('layout__sidebar--slim');
                });
                timelineStage1.play();
            }
        }
    });
}

/**
 * Assigns the parent sidebar element, and attaches a Mutation Observer
 * which watches the coallapsable nodes inside of the sidebar menu
 * and animates them on chenages
 * 
 * @param {HTMLElement} parentElement SidebarMenu parent
 */
SlimSidebarAnimate.prototype.assignParentElement = function (parentElement) {
    // Reassign Observer Element
    this._nodesObserver.disconnect();
    this._nodesObserver.observe(parentElement, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true,
        subtree: false
    });
};

/**
 * Disconnects the observer
 */
SlimSidebarAnimate.prototype.destroy = function() {
    this._nodesObserver.disconnect();
};

module.exports = SlimSidebarAnimate;
},{"animejs":9}],7:[function(require,module,exports){
var SIZES = [
    { size: 'xs', query: '(max-width: 575.8px)' },
    { size: 'sm', query: '(min-width: 576px) and (max-width: 767.8px)' },
    { size: 'md', query: '(min-width: 768px) and (max-width: 991.8px)' },
    { size: 'lg', query: '(min-width: 992px) and (max-width: 1199.8px)' },
    { size: 'xl', query: '(min-width: 1200px)' },
];

function getCurrentBsScreenSize() {
    var screenSize = 'xl';

    SIZES.forEach(function(sizeDef) {
        if (window.matchMedia(sizeDef.query).matches) {
            screenSize = sizeDef.size;
        }
    });

    return screenSize;
}

function isElementInCollapsedNavbar(element) {
    var navbar = element.closest('.navbar');
    var collapse = element.closest('.navbar-collapse');

    if (navbar && collapse) {
        var currentScreenSize = getCurrentBsScreenSize();
        var navbarClasses = navbar.className.split(' ');

        for (var i = 0; i < navbarClasses.length; i++) {
            var className = navbarClasses[i];
            // Avoid Regexp for better performance
            if (
                className === 'navbar-expand-xs' ||
                className === 'navbar-expand-sm' ||
                className === 'navbar-expand-md' ||
                className === 'navbar-expand-lg' ||
                className === 'navbar-expand-xl'
            ) {
                var collapseSize = className.replace('navbar-expand-', '');
                var collapseSizeIndex = SIZES.findIndex(
                    function (sizeDef) { return sizeDef.size === collapseSize; }
                );
                var currentScreenSizeIndex = SIZES.findIndex(
                    function (sizeDef) { return sizeDef.size === currentScreenSize; }
                );
                return currentScreenSizeIndex < collapseSizeIndex;
            }
        }

        return navbar.classList.contains('navbar-expand-' + currentScreenSize);
    }

    return false;
}

module.exports = {
    getCurrentBsScreenSize: getCurrentBsScreenSize,
    isElementInCollapsedNavbar: isElementInCollapsedNavbar,
};

},{}],8:[function(require,module,exports){
(function () {
    var SideMenuAnimate = require('./../../_js-common-modules/side-menu-animate');
    var SlimSidebarAnimate = require('./../../_js-common-modules/slim-sidebar-animate');
    var SidebarEntryAnimate = require('./../../_js-common-modules/sidebar-entry-animate');
    var SlimMenuAnimate = require('./../../_js-common-modules/slim-menu-animate');
    var DropdownMenuAnimate = require('./../../_js-common-modules/dropdown-menu-animate');
    var NestedDropdownAnimate = require('./../../_js-common-modules/nested-dropdown-animate');

    var sidebarElement = document.querySelector('.sidebar');
    var sideMenuElement = document.querySelector('.sidebar .sidebar-menu');
    var dropdownMenus = document.querySelectorAll('.dropdown-menu');
    var nestedDropdowns = document.querySelectorAll('.nested-dropdown');

    if (sideMenuElement) {
        var sideMenuAnimate = new SideMenuAnimate();

        sideMenuAnimate.assignParentElement(sideMenuElement);
    }

    if (sidebarElement) {
        var slimSidebarAnimate = new SlimSidebarAnimate();
        var sidebarEntryAnimate = new SidebarEntryAnimate({ duration: 200 });
        var slimMenuAnimate = new SlimMenuAnimate();

        slimSidebarAnimate.assignParentElement(sidebarElement);
        sidebarEntryAnimate.assignParentElement(sidebarElement);
        slimMenuAnimate.assignSidebarElement(sidebarElement);

        sidebarEntryAnimate.executeAnimation()
            .then(function() {
                sidebarElement.classList.add('sidebar--animate-entry-complete');
            });
    }

    if (dropdownMenus && dropdownMenus.length > 0) {
        var dropdownMenuAnimate = new DropdownMenuAnimate();

        dropdownMenuAnimate.initializeWatcher(dropdownMenus);
    }

    if (nestedDropdowns && nestedDropdowns.length > 0) {
        var nestedDropdownAnimate = new NestedDropdownAnimate();

        nestedDropdownAnimate.initialize(nestedDropdowns);
    }
})();
},{"./../../_js-common-modules/dropdown-menu-animate":1,"./../../_js-common-modules/nested-dropdown-animate":2,"./../../_js-common-modules/side-menu-animate":3,"./../../_js-common-modules/sidebar-entry-animate":4,"./../../_js-common-modules/slim-menu-animate":5,"./../../_js-common-modules/slim-sidebar-animate":6}],9:[function(require,module,exports){
/*
 * anime.js v3.1.0
 * (c) 2019 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

'use strict';

// Defaults

var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective'];

// Caching

var cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) { return Array.isArray(a); },
  obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
  pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
  svg: function (a) { return a instanceof SVGElement; },
  inp: function (a) { return a instanceof HTMLInputElement; },
  dom: function (a) { return a.nodeType || is.svg(a); },
  str: function (a) { return typeof a === 'string'; },
  fnc: function (a) { return typeof a === 'function'; },
  und: function (a) { return typeof a === 'undefined'; },
  hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
  rgb: function (a) { return /^rgb/.test(a); },
  hsl: function (a) { return /^hsl/.test(a); },
  col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
  key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) { return t; }
    return 1 - progress;
  }

  function getDuration() {
    var cached = cache.springs[string];
    if (cached) { return cached; }
    var frame = 1/6;
    var elapsed = 0;
    var rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) { break; }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if ( steps === void 0 ) steps = 10;

  return function (t) { return Math.round(t * steps) * (1 / steps); };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = (function () {

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
  function C(aA1)      { return 3.0 * aA1 }

  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) { return aGuessT; }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) { return x; }
      if (x === 0 || x === 1) { return x; }
      return calcBezier(getTForX(x), mY1, mY2);
    }

  }

  return bezier;

})();

var penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = { linear: function () { return function (t) { return t; }; } };

  var functionEasings = {
    Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
    Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
    Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
    Bounce: function () { return function (t) {
      var pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    }; },
    Elastic: function (amplitude, period) {
      if ( amplitude === void 0 ) amplitude = 1;
      if ( period === void 0 ) period = .5;

      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
  });

  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
    eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
      1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
  });

  return eases;

})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) { return easing; }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps, args);
    default : return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch(e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
}

function toArray(o) {
  if (is.arr(o)) { return o; }
  if (is.str(o)) { o = selectString(o) || o; }
  if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) { return a === val; });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) { clone[p] = o[p]; }
  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val) {
  if (is.rgb(val)) { return rgbToRgba(val); }
  if (is.hex(val)) { return hexToRgba(val); }
  if (is.hsl(val)) { return hslToRgba(val); }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) { return split[1]; }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) { return val; }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) { return cached; }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || (is.svg(el) && el[prop]))) { return 'attribute'; }
  if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
  if (el[prop] != null) { return 'object'; }
}

function getElementTransforms(el) {
  if (!is.dom(el)) { return; }
  var str = el.style.transform || '';
  var reg  = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return getAttribute(target, propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) { return to; }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) { return colorToRgb(val); }
  if (/\s/g.test(val)) { return val; }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) { return unitLess + unit; }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0 ; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) { return el.getTotalLength(); }
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) { break; }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width / viewBox[2],
    h: height / viewBox[3]
  }
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathProgress(path, progress) {
  function point(offset) {
    if ( offset === void 0 ) offset = 0;

    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  switch (path.property) {
    case 'x': return (p.x - svg.x) * svg.w;
    case 'y': return (p.y - svg.y) * svg.h;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  }
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
    return obj;
  }).map(function (k) { return mergeObjects(k, settings); });
}


function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
  .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
  var properties = {};
  var loop = function ( i ) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) { newKey.value = key[p]; }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop( i );
  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) { return getFunctionValue(v, animatable); });
      if (value.length === 1) { value = value[0]; }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) { to = previousValue; }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) { tween.round = 1; }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) { return t.style[p] = v; },
  attribute: function (t, p, v) { return t.setAttribute(p, v); },
  object: function (t, p, v) { return t[p] = v; },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    }
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) { return !is.und(a); });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];
var pausedInstances = [];
var raf;

var engine = (function () {
  function play() { 
    raf = requestAnimationFrame(step);
  }
  function step(t) {
    var activeInstancesLength = activeInstances.length;
    if (activeInstancesLength) {
      var i = 0;
      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];
        if (!activeInstance.paused) {
          activeInstance.tick(t);
        } else {
          var instanceIndex = activeInstances.indexOf(activeInstance);
          if (instanceIndex > -1) {
            activeInstances.splice(instanceIndex, 1);
            activeInstancesLength = activeInstances.length;
          }
        }
        i++;
      }
      play();
    } else {
      raf = cancelAnimationFrame(raf);
    }
  }
  return play;
})();

function handleVisibilityChange() {
  if (document.hidden) {
    activeInstances.forEach(function (ins) { return ins.pause(); });
    pausedInstances = activeInstances.slice(0);
    anime.running = activeInstances = [];
  } else {
    pausedInstances.forEach(function (ins) { return ins.play(); });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Public Instance

function anime(params) {
  if ( params === void 0 ) params = {};


  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  var promise = makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) { return child.reversed = instance.reversed; });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) { child.seek(time - child.timelineOffset); }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
    } else {
      for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = (void 0);
      for (var n = 0; n < toNumbersLength; n++) {
        var value = (void 0);
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) { syncInstanceChildren(insTime); }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) { setCallback('update'); }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) { instance.children[i].reset(); }
    if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // Set Value helper

  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function(t) {
    now = t;
    if (!startTime) { startTime = now; }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };

  instance.play = function() {
    if (!instance.paused) { return; }
    if (instance.completed) { instance.reset(); }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    if (!raf) { engine(); }
  };

  instance.reverse = function() {
    toggleInstanceDirection();
    resetTime();
  };

  instance.restart = function() {
    instance.reset();
    instance.play();
  };

  instance.reset();

  if (instance.autoplay) { instance.play(); }

  return instance;

}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargets(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
    }
    if (!animations.length && !children.length) { instance.pause(); }
  }
}

// Stagger helpers

function stagger(val, params) {
  if ( params === void 0 ) params = {};

  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) { fromIndex = 0; }
    if (fromCenter) { fromIndex = (t - 1) / 2; }
    if (fromLast) { fromIndex = t - 1; }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
          var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
          var toX = index%grid[0];
          var toY = Math.floor(index/grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') { value = -distanceX; }
          if (axis === 'y') { value = -distanceY; }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
      if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  }
}

// Timeline

function timeline(params) {
  if ( params === void 0 ) params = {};

  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
    function passThrough(ins) { ins.passThrough = true; }
    for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) { tl.play(); }
    return tl;
  };
  return tl;
}

anime.version = '3.1.0';
anime.speed = 1;
anime.running = activeInstances;
anime.remove = removeTargets;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

module.exports = anime;

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJfanMtY29tbW9uLW1vZHVsZXMvZHJvcGRvd24tbWVudS1hbmltYXRlLmpzIiwiX2pzLWNvbW1vbi1tb2R1bGVzL25lc3RlZC1kcm9wZG93bi1hbmltYXRlLmpzIiwiX2pzLWNvbW1vbi1tb2R1bGVzL3NpZGUtbWVudS1hbmltYXRlLmpzIiwiX2pzLWNvbW1vbi1tb2R1bGVzL3NpZGViYXItZW50cnktYW5pbWF0ZS5qcyIsIl9qcy1jb21tb24tbW9kdWxlcy9zbGltLW1lbnUtYW5pbWF0ZS5qcyIsIl9qcy1jb21tb24tbW9kdWxlcy9zbGltLXNpZGViYXItYW5pbWF0ZS5qcyIsIl9qcy1jb21tb24tbW9kdWxlcy91dGlsaXRpZXMuanMiLCJhc3NldHMvanMvYW5pbWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9hbmltZWpzL2xpYi9hbmltZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gRGVmYXVsdCBpbXBvcnQgZml4XG52YXIgYW5pbWUgPSByZXF1aXJlKCdhbmltZWpzJykuZGVmYXVsdCA/XG4gICAgcmVxdWlyZSgnYW5pbWVqcycpLmRlZmF1bHQgOiByZXF1aXJlKCdhbmltZWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxpdGllcycpO1xuXG5mdW5jdGlvbiBEcm9wZG93bk1lbnVBbmltYXRlKGNvbmZpZykge1xuICAgIHRoaXMuZHJvcGRvd25NZW51cyA9IFtdO1xuICAgIHRoaXMuZHJvcGRvd25NZW51T2JzZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogMzAwLFxuICAgICAgICBhbmltYXRpb25TdGVwT2Zmc2V0OiAwLjEsXG4gICAgICAgIHRyYW5zbGF0aW9uRGVsdGE6IDEwLFxuICAgICAgICBpbml0aWFsU2NhbGU6IDAuOCxcbiAgICAgICAgYW5pbWVFYXNpbmc6ICdlYXNlT3V0RWxhc3RpYygxLjUsIDAuOCknLFxuICAgIH0sIGNvbmZpZyk7XG59XG5cbmZ1bmN0aW9uIHBsYWNlbWVudFRvVHJhbnNmb3JtT3JpZ2luKHBsYWNlbWVudCkge1xuICAgIHZhciBwbGFjZW1lbnRQYXJ0cyA9IChwbGFjZW1lbnQgfHwgJycpLnNwbGl0KCctJyk7XG4gICAgaWYgKHBsYWNlbWVudFBhcnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICB2YXIgcGxhY2VtZW50QSA9IHBsYWNlbWVudFBhcnRzWzBdO1xuICAgICAgICB2YXIgcGxhY2VtZW50QiA9IHBsYWNlbWVudFBhcnRzWzFdO1xuICAgICAgICB2YXIgeE9yaWdpbiA9ICdjZW50ZXInO1xuICAgICAgICB2YXIgeU9yaWdpbiA9ICdjZW50ZXInO1xuXG4gICAgICAgIC8vIEhvcml6b250YWxcbiAgICAgICAgaWYgKHBsYWNlbWVudEEgPT09ICd0b3AnIHx8IHBsYWNlbWVudEEgPT09ICdib3R0b20nKSB7XG4gICAgICAgICAgICAvLyBJbnZlcnNpb24gaXMgbmVlZGVkXG4gICAgICAgICAgICB5T3JpZ2luID0gcGxhY2VtZW50QSA9PT0gJ3RvcCcgPyAnYm90dG9tJyA6ICd0b3AnO1xuICAgICAgICAgICAgeE9yaWdpbiA9IHBsYWNlbWVudEIgPT09ICdzdGFydCcgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9WZXJ0aWNhbFxuICAgICAgICBpZiAocGxhY2VtZW50QSA9PT0gJ2xlZnQnIHx8IHBsYWNlbWVudEEgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIC8vIEludmVyc2lvbiBpcyBuZWVkZWRcbiAgICAgICAgICAgIHhPcmlnaW4gPSBwbGFjZW1lbnRBID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAgICAgICAgICAgeU9yaWdpbiA9IHBsYWNlbWVudEIgPT09ICdzdGFydCcgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHhPcmlnaW4gKyAnICcgKyB5T3JpZ2luO1xuICAgIH1cbiAgICByZXR1cm4gJ2NlbnRlciBjZW50ZXInO1xufVxuXG5mdW5jdGlvbiBvcmlnaW5Ub1RyYW5zbGF0ZShvcmlnaW4sIGRlbHRhKSB7XG4gICAgdmFyIG9yaWdpblBhcnRzID0gKG9yaWdpbiB8fCAnJykuc3BsaXQoJyAnKTtcbiAgICBpZiAob3JpZ2luUGFydHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHZhciB4T3JpZ2luID0gb3JpZ2luUGFydHNbMF07XG4gICAgICAgIHZhciB5T3JpZ2luID0gb3JpZ2luUGFydHNbMV07XG4gICAgICAgIHZhciBzdGFydFhUcmFuc2Zvcm0gPSAwO1xuICAgICAgICB2YXIgc3RhcnRZVHJhbnNmb3JtID0gMDtcblxuICAgICAgICBpZiAoeE9yaWdpbiA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICBzdGFydFhUcmFuc2Zvcm0gPSAtZGVsdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHhPcmlnaW4gPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgIHN0YXJ0WFRyYW5zZm9ybSA9IGRlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmICh5T3JpZ2luID09PSAndG9wJykge1xuICAgICAgICAgICAgc3RhcnRZVHJhbnNmb3JtID0gLWRlbHRhO1xuICAgICAgICB9XG4gICAgICAgIGlmICh5T3JpZ2luID09PSAnYm90dG9tJykge1xuICAgICAgICAgICAgc3RhcnRZVHJhbnNmb3JtID0gZGVsdGE7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHJhbnNmb3JtWDogW3N0YXJ0WFRyYW5zZm9ybSwgMF0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1ZOiBbc3RhcnRZVHJhbnNmb3JtLCAwXVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRyYW5zZm9ybVg6IFswLCAwXSxcbiAgICAgICAgdHJhbnNmb3JtWTogWzAsIDBdXG4gICAgfTtcbn1cblxuRHJvcGRvd25NZW51QW5pbWF0ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZVdhdGNoZXIgPSBmdW5jdGlvbihkcm9wZG93bk1lbnVzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuZHJvcGRvd25NZW51cyA9IE5vZGVMaXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGRyb3Bkb3duTWVudXMpID9cbiAgICAgICAgQXJyYXkuZnJvbShkcm9wZG93bk1lbnVzKSA6IFtkcm9wZG93bk1lbnVzXTtcblxuICAgIHRoaXMuZHJvcGRvd25NZW51T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgICAgbXV0YXRpb25zLmZvckVhY2goZnVuY3Rpb24obXV0YXRpb24pIHtcbiAgICAgICAgICAgIHZhciBwcmV2U2hvdyA9IG11dGF0aW9uLm9sZFZhbHVlLmluZGV4T2YoJ3Nob3cnKSA+PSAwO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTaG93ID0gbXV0YXRpb24udGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2hvdycpO1xuXG4gICAgICAgICAgICBpZiAoIXByZXZTaG93ICYmIGN1cnJlbnRTaG93KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuYW5pbWF0ZUluKG11dGF0aW9uLnRhcmdldCwgbXV0YXRpb24udGFyZ2V0LnBhcmVudEVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuZHJvcGRvd25NZW51cy5mb3JFYWNoKGZ1bmN0aW9uKGRyb3Bkb3duTWVudSkge1xuICAgICAgICBpZiAoZHJvcGRvd25NZW51KSB7XG4gICAgICAgICAgICBfdGhpcy5kcm9wZG93bk1lbnVPYnNlcnZlci5vYnNlcnZlKGRyb3Bkb3duTWVudSwge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10sXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlT2xkVmFsdWU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuRHJvcGRvd25NZW51QW5pbWF0ZS5wcm90b3R5cGUuZGVzdHJveVdhdGNoZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5kcm9wZG93bk1lbnVPYnNlcnZlcikge1xuICAgICAgICB0aGlzLmRyb3Bkb3duTWVudU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICB9XG59O1xuXG5Ecm9wZG93bk1lbnVBbmltYXRlLnByb3RvdHlwZS5hbmltYXRlSW4gPSBmdW5jdGlvbihtZW51RWxlbWVudCwgcGFyZW50RWxlbWVudCkge1xuICAgIGlmICghdXRpbHMuaXNFbGVtZW50SW5Db2xsYXBzZWROYXZiYXIocGFyZW50RWxlbWVudCkpIHtcbiAgICAgICAgLy8gRGV0ZXJpbWluZSBwbGFjZW1lbnQgYnkgUG9wcGVyIGF0dHJpYnV0ZVxuICAgICAgICB2YXIgcG9wcGVyUGxhY2VtZW50ID0gbWVudUVsZW1lbnQuYXR0cmlidXRlc1sneC1wbGFjZW1lbnQnXSAmJlxuICAgICAgICAgICAgbWVudUVsZW1lbnQuYXR0cmlidXRlc1sneC1wbGFjZW1lbnQnXS5ub2RlVmFsdWU7XG4gICAgICAgIC8vIERldGVyaW1uZSBwbGFjZW1lbnQgYnkgY2xhc3NlcyBvbiBlbGVtZW50c1xuICAgICAgICB2YXIgY2xhc3NQbGFjZW1lbnQgPVxuICAgICAgICAgICAgKHBhcmVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdkcm9wdXAnKSA/ICd0b3AnIDogJ2JvdHRvbScpICsgJy0nICtcbiAgICAgICAgICAgIChtZW51RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duLW1lbnUtcmlnaHQnKSA/ICdlbmQnIDogJ3N0YXJ0Jyk7XG4gICAgICAgIC8vIERldGVyaW1uZSB0aGUgZmluYWwgcGxhY2VtZW50IC0gUG9wcGVyIHByaW9yaXR5XG4gICAgICAgIHZhciBwbGFjZW1lbnQgPSBwb3BwZXJQbGFjZW1lbnQgfHwgY2xhc3NQbGFjZW1lbnQ7XG4gICAgICAgIC8vIEdlbmVyYXRlIGEgVHJhbnNmb3JtIE9yaWdpblxuICAgICAgICB2YXIgdHJhbnNmb3JtT3JpZ2luID0gcGxhY2VtZW50VG9UcmFuc2Zvcm1PcmlnaW4ocGxhY2VtZW50KTtcbiAgICAgICAgLy8gR2VuZXJhdGUgdGFyZ2V0IHRyYW5zbGF0aW9uIGJhc2VkIG9uIFRyYW5zZm9ybSBPcmlnaW5cbiAgICAgICAgdmFyIHRhcmdldFRyYW5zbGF0aW9ucyA9IG9yaWdpblRvVHJhbnNsYXRlKFxuICAgICAgICAgICAgdHJhbnNmb3JtT3JpZ2luLFxuICAgICAgICAgICAgdGhpcy5jb25maWcudHJhbnNsYXRpb25EZWx0YVxuICAgICAgICApO1xuXG4gICAgICAgIHZhciB0aW1lbGluZSA9IGFuaW1lLnRpbWVsaW5lKHtcbiAgICAgICAgICAgIHRhcmdldHM6IG1lbnVFbGVtZW50LFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuY29uZmlnLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgICAgYmVnaW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1lbnVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9IHRyYW5zZm9ybU9yaWdpbjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pLmFkZCh7XG4gICAgICAgICAgICBvcGFjaXR5OiBbMCwgMV0sXG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0Q3ViaWMnLFxuICAgICAgICB9KS5hZGQoXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICAgICAgc2NhbGU6IFt0aGlzLmNvbmZpZy5pbml0aWFsU2NhbGUsIDFdLFxuICAgICAgICAgICAgICAgIGVhc2luZzogdGhpcy5jb25maWcuYW5pbWVFYXNpbmcsXG4gICAgICAgICAgICB9LCB0YXJnZXRUcmFuc2xhdGlvbnMpLFxuICAgICAgICAgICAgdGhpcy5jb25maWcuYW5pbWF0aW9uRHVyYXRpb24gKiB0aGlzLmNvbmZpZy5hbmltYXRpb25TdGVwT2Zmc2V0XG4gICAgICAgICk7XG4gICAgfVxufTtcblxuRHJvcGRvd25NZW51QW5pbWF0ZS5wcm90b3R5cGUuX2FuaW1hdGVPdXQgPSBmdW5jdGlvbihtZW51RWxlbWVudCkge1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcm9wZG93bk1lbnVBbmltYXRlOyIsIi8vIERlZmF1bHQgaW1wb3J0IGZpeFxudmFyIGFuaW1lID0gcmVxdWlyZSgnYW5pbWVqcycpLmRlZmF1bHQgP1xuICAgIHJlcXVpcmUoJ2FuaW1lanMnKS5kZWZhdWx0IDogcmVxdWlyZSgnYW5pbWVqcycpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlsaXRpZXMnKTtcblxuZnVuY3Rpb24gTmVzdGVkRHJvcGRvd25BbmltYXRlKGNvbmZpZykge1xuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICBhbmltYXRpb25EdXJhdGlvbjogMTUwLFxuICAgICAgICBhbmltYXRpb25TdGVwT2Zmc2V0OiAwLjEsXG4gICAgICAgIHRyYW5zbGF0aW9uRGVsdGE6IDEwLFxuICAgICAgICBpbml0aWFsU2NhbGU6IDAuOCxcbiAgICAgICAgYW5pbWVFYXNpbmc6ICdlYXNlT3V0RWxhc3RpYygxLjUsIDAuOCknLFxuICAgIH0sIGNvbmZpZyk7XG4gICAgdGhpcy5ib3VuZEV4ZWN1dGVBbmltYXRpb24gPVxuICAgICAgICB0aGlzLl9leGVjdXRlQW5pbWF0aW9uLmJpbmQodGhpcyk7XG59XG5cbk5lc3RlZERyb3Bkb3duQW5pbWF0ZS5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKGRyb3Bkb3duUGFyZW50cykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB2YXIgbmVzdGVkRHJvcGRvd25zID0gTm9kZUxpc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoZHJvcGRvd25QYXJlbnRzKSA/XG4gICAgICAgIEFycmF5LmZyb20oZHJvcGRvd25QYXJlbnRzKSA6IFtkcm9wZG93blBhcmVudHNdO1xuICAgIHRoaXMuZHJvcGRvd25TdWJtZW51TGlua3MgPSBuZXN0ZWREcm9wZG93bnNcbiAgICAgICAgLm1hcChmdW5jdGlvbihkcm9wZG93bikge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICAgICAgICAgICAgZHJvcGRvd24ucXVlcnlTZWxlY3RvckFsbCgnLm5lc3RlZC1kcm9wZG93bl9fc3VibWVudS1pdGVtX19saW5rJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pXG4gICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24oYWNjLCBsaW5rRWxlbWVudHMpIHtcbiAgICAgICAgICAgIHJldHVybiBhY2MuY29uY2F0KGxpbmtFbGVtZW50cyk7XG4gICAgICAgIH0sIFtdKTtcbiAgICBcbiAgICB0aGlzLmRyb3Bkb3duU3VibWVudUxpbmtzLmZvckVhY2goZnVuY3Rpb24oZHJvcGRvd25TdWJtZW51TGluaykge1xuICAgICAgICBkcm9wZG93blN1Ym1lbnVMaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBfdGhpcy5ib3VuZEV4ZWN1dGVBbmltYXRpb24pO1xuICAgIH0pO1xufTtcblxuTmVzdGVkRHJvcGRvd25BbmltYXRlLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5kcm9wZG93blN1Ym1lbnVMaW5rcy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5ib3VuZEV4ZWN1dGVBbmltYXRpb24pO1xufTtcblxuTmVzdGVkRHJvcGRvd25BbmltYXRlLnByb3RvdHlwZS5fZXhlY3V0ZUFuaW1hdGlvbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gQW5pbWF0ZSBvbmx5IGluIHVuY29sbGFwc2VkIGRyb3Bkb3duc1xuICAgIGlmICghdXRpbHMuaXNFbGVtZW50SW5Db2xsYXBzZWROYXZiYXIoZXZlbnQuY3VycmVudFRhcmdldCkpIHtcbiAgICAgICAgdmFyIG1lbnVFbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldC5uZXh0RWxlbWVudFNpYmxpbmc7XG4gICAgICAgIHZhciB0aW1lbGluZSA9IGFuaW1lLnRpbWVsaW5lKHtcbiAgICAgICAgICAgIHRhcmdldHM6IG1lbnVFbGVtZW50LFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuY29uZmlnLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgICAgYmVnaW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1lbnVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICdsZWZ0LXRvcCc7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KS5hZGQoe1xuICAgICAgICAgICAgb3BhY2l0eTogWzAsIDFdLFxuICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dEN1YmljJyxcbiAgICAgICAgfSkuYWRkKHtcbiAgICAgICAgICAgIHNjYWxlOiBbdGhpcy5jb25maWcuaW5pdGlhbFNjYWxlLCAxXSxcbiAgICAgICAgICAgIGVhc2luZzogdGhpcy5jb25maWcuYW5pbWVFYXNpbmcsXG4gICAgICAgICAgICB0cmFuc2xhdGVYOiBbLXRoaXMuY29uZmlnLnRyYW5zbGF0aW9uRGVsdGEsIDBdLFxuICAgICAgICAgICAgdHJhbnNsYXRlWTogWy10aGlzLmNvbmZpZy50cmFuc2xhdGlvbkRlbHRhLCAwXSxcbiAgICAgICAgfSwgdGhpcy5jb25maWcuYW5pbWF0aW9uRHVyYXRpb24gKiB0aGlzLmNvbmZpZy5hbmltYXRpb25TdGVwT2Zmc2V0KTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5lc3RlZERyb3Bkb3duQW5pbWF0ZTsiLCIvLyBEZWZhdWx0IGltcG9ydCBmaXhcbnZhciBhbmltZSA9IHJlcXVpcmUoJ2FuaW1lanMnKS5kZWZhdWx0ID9cbiAgICByZXF1aXJlKCdhbmltZWpzJykuZGVmYXVsdCA6IHJlcXVpcmUoJ2FuaW1lanMnKTtcblxuZnVuY3Rpb24gU2lkZU1lbnVBbmltYXRlKGNvbmZpZykge1xuICAgIHZhciBhY3RpdmVBbmltYXRpb247XG5cbiAgICB2YXIgb3B0aW9uID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgeyB9LFxuICAgICAgICB7XG4gICAgICAgICAgICBlYXNpbmc6ICdlYXNlSW5PdXRDdWJpYycsXG4gICAgICAgICAgICBkdXJhdGlvbjogMzAwLFxuICAgICAgICB9LFxuICAgICAgICBjb25maWdcbiAgICApO1xuICAgIFxuICAgIHRoaXMuX25vZGVzT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgIHZhciBjaGFuZ2VkTm9kZXMgPSBtdXRhdGlvbnNcbiAgICAgICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKG11dGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24udGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2lkZWJhci1tZW51X19lbnRyeS0tbmVzdGVkJykgfHxcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24udGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucygnc2lkZWJhci1zdWJtZW51X19lbnRyeS0tbmVzdGVkJylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKG11dGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogbXV0YXRpb24udGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICB3YXNPcGVuOiBtdXRhdGlvbi5vbGRWYWx1ZS5pbmRleE9mKCdvcGVuJykgPj0gMCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY2hhbmdlZE5vZGVzLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHZhciBpc09wZW4gPSBub2RlLnRhcmdldC5jbGFzc0xpc3QuY29udGFpbnMoJ29wZW4nKTtcblxuICAgICAgICAgICAgaWYgKGlzT3BlbiAhPT0gbm9kZS53YXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lbnUgPSBub2RlLnRhcmdldC5xdWVyeVNlbGVjdG9yKCcuc2lkZWJhci1zdWJtZW51Jyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYWN0aXZlQW5pbWF0aW9uICYmICFhY3RpdmVBbmltYXRpb24uY29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZUFuaW1hdGlvbi5yZXNldCgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGFjdGl2ZUFuaW1hdGlvbiA9IGFuaW1lKHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0czogbWVudSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBpc09wZW4gP1xuICAgICAgICAgICAgICAgICAgICAgICAgWzAsIG1lbnUuc2Nyb2xsSGVpZ2h0XSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBbbWVudS5zY3JvbGxIZWlnaHQsIDBdLFxuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogb3B0aW9uLmR1cmF0aW9uLFxuICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IG9wdGlvbi5lYXNpbmdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhY3RpdmVBbmltYXRpb24uZmluaXNoZWQudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVudS5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gICAgICAgICAgICBcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogQXNzaWducyB0aGUgcGFyZW50IHNpZGViYXIgZWxlbWVudCwgYW5kIGF0dGFjaGVzIGEgTXV0YXRpb24gT2JzZXJ2ZXJcbiAqIHdoaWNoIHdhdGNoZXMgdGhlIGNvYWxsYXBzYWJsZSBub2RlcyBpbnNpZGUgb2YgdGhlIHNpZGViYXIgbWVudVxuICogYW5kIGFuaW1hdGVzIHRoZW0gb24gY2hlbmFnZXNcbiAqIFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWxlbWVudCBTaWRlYmFyTWVudSBwYXJlbnRcbiAqL1xuU2lkZU1lbnVBbmltYXRlLnByb3RvdHlwZS5hc3NpZ25QYXJlbnRFbGVtZW50ID0gZnVuY3Rpb24gKHBhcmVudEVsZW1lbnQpIHtcbiAgICAvLyBSZWFzc2lnbiBPYnNlcnZlciBFbGVtZW50XG4gICAgdGhpcy5fbm9kZXNPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgdGhpcy5fbm9kZXNPYnNlcnZlci5vYnNlcnZlKHBhcmVudEVsZW1lbnQsIHtcbiAgICAgICAgYXR0cmlidXRlczogdHJ1ZSxcbiAgICAgICAgYXR0cmlidXRlRmlsdGVyOiBbJ2NsYXNzJ10sXG4gICAgICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgICAgICBzdWJ0cmVlOiB0cnVlXG4gICAgfSk7XG59O1xuXG4vKipcbiAqIERpc2Nvbm5lY3RzIHRoZSBvYnNlcnZlclxuICovXG5TaWRlTWVudUFuaW1hdGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9ub2Rlc09ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbn07XG5cbi8qKlxuICogRGlzY29ubmVjdHMgdGhlIG9ic2VydmVyXG4gKi9cblNpZGVNZW51QW5pbWF0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX25vZGVzT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGVNZW51QW5pbWF0ZTtcbiIsIi8vIERlZmF1bHQgaW1wb3J0IGZpeFxudmFyIGFuaW1lID0gcmVxdWlyZSgnYW5pbWVqcycpLmRlZmF1bHQgP1xuICAgIHJlcXVpcmUoJ2FuaW1lanMnKS5kZWZhdWx0IDogcmVxdWlyZSgnYW5pbWVqcycpO1xuXG5mdW5jdGlvbiBTaWRlYmFyRW50cnlBbmltYXRlKG9wdGlvbnMpIHtcbiAgICAvLyBGbGFnIHRvIGVuc3VyZSB0aGUgYW5pbWF0aW9uIGlzIGZpcmVkIG9ubHkgb25jZVxuICAgIHRoaXMud2FzQW5pbWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnNpZGViYXJFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgZWFzaW5nOiAnbGluZWFyJ1xuICAgIH0sIG9wdGlvbnMpO1xufVxuXG5TaWRlYmFyRW50cnlBbmltYXRlLnByb3RvdHlwZS5leGVjdXRlQW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbmZpZyA9IHRoaXMuY29uZmlnO1xuXG4gICAgdmFyIHNpZGViYXJFbGVtZW50ID0gdGhpcy5zaWRlYmFyRWxlbWVudDtcblxuICAgIGlmICghdGhpcy53YXNBbmltYXRlZCAmJiBzaWRlYmFyRWxlbWVudCkge1xuICAgICAgICB2YXIgaXNTbGltID0gKFxuICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaWRlYmFyLS1zbGltJykgJiZcbiAgICAgICAgICAgIHNpZGViYXJFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnc2lkZWJhci0tY29sbGFwc2VkJylcbiAgICAgICAgKTtcbiAgICAgICAgdmFyIHNpZGViYXJNZW51ID0gc2lkZWJhckVsZW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICcuc2lkZWJhci1tZW51J1xuICAgICAgICApO1xuXG4gICAgICAgIHZhciBzaWRlYmFyU2VjdGlvbnNQcmVNZW51ID0gW107XG4gICAgICAgIHZhciBzaWRlYmFyTWVudVNlY3Rpb24gPSBudWxsO1xuICAgICAgICB2YXIgc2lkZU1lbnVFbnRyaWVzID0gW107XG4gICAgICAgIHZhciBzaWRlYmFyU2VjdGlvbnNQb3N0TWVudSA9IFtdO1xuXG4gICAgICAgIHNpZGViYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyX19zZWN0aW9uJylcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKHNlY3Rpb25FbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gT21taXQgc2VjdGlvbnMgd2hpY2ggYXJlbnQgdmlzaWJsZVxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNTbGltICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWN0aW9uRWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ3NpZGViYXJfX2hpZGUtc2xpbScpXG4gICAgICAgICAgICAgICAgICAgICkgfHwgKFxuICAgICAgICAgICAgICAgICAgICAgICAgIWlzU2xpbSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbkVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaWRlYmFyX19zaG93LXNsaW0nKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoc2VjdGlvbkVsZW1lbnQuY29udGFpbnMoc2lkZWJhck1lbnUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZGViYXJNZW51U2VjdGlvbiA9IHNlY3Rpb25FbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgc2lkZW1lbnUgZW50cmllc1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2lkZWJhck1lbnVFbnRyaWVzTm9kZXMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VjdGlvbkVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnLnNpZGViYXItbWVudSA+IC5zaWRlYmFyLW1lbnVfX2VudHJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgc2lkZU1lbnVFbnRyaWVzID0gc2lkZU1lbnVFbnRyaWVzLmNvbmNhdChcbiAgICAgICAgICAgICAgICAgICAgICAgIEFycmF5LmZyb20oc2lkZWJhck1lbnVFbnRyaWVzTm9kZXMpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNpZGVNZW51RW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgcG9zdCBtZW51IHNlY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFyU2VjdGlvbnNQb3N0TWVudVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wdXNoKHNlY3Rpb25FbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFkZCBwcmUgbWVudSBzZWN0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhclNlY3Rpb25zUHJlTWVudVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5wdXNoKHNlY3Rpb25FbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB0aW1lbGluZSA9IGFuaW1lLnRpbWVsaW5lKHtcbiAgICAgICAgICAgIGVhc2luZzogY29uZmlnLmVhc2luZyxcbiAgICAgICAgICAgIGR1cmF0aW9uOiBjb25maWcuZHVyYXRpb24sXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgc2VjdGlvbiBzdHlsZXNcbiAgICAgICAgICAgICAgICBbXS5jb25jYXQoXG4gICAgICAgICAgICAgICAgICAgIHNpZGViYXJTZWN0aW9uc1ByZU1lbnUsXG4gICAgICAgICAgICAgICAgICAgIHNpZGVNZW51RW50cmllcyxcbiAgICAgICAgICAgICAgICAgICAgc2lkZWJhclNlY3Rpb25zUG9zdE1lbnVcbiAgICAgICAgICAgICAgICApLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBzdGFnZ2VyRGVsYXkgPVxuICAgICAgICAgICAgY29uZmlnLmR1cmF0aW9uIC8gKFxuICAgICAgICAgICAgICAgIHNpZGViYXJTZWN0aW9uc1ByZU1lbnUubGVuZ3RoICtcbiAgICAgICAgICAgICAgICBzaWRlYmFyU2VjdGlvbnNQb3N0TWVudS4gbGVuZ3RoXG4gICAgICAgICAgICApIC8gc2lkZU1lbnVFbnRyaWVzLmxlbmd0aDtcbiAgICAgICAgdGltZWxpbmVcbiAgICAgICAgICAgIC5hZGQoe1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJTZWN0aW9uc1ByZU1lbnUsXG4gICAgICAgICAgICAgICAgZGVsYXk6IGFuaW1lLnN0YWdnZXIoc3RhZ2dlckRlbGF5KSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiBbMCwgMV1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICB0YXJnZXRzOiBzaWRlTWVudUVudHJpZXMsXG4gICAgICAgICAgICAgICAgZGVsYXk6IGFuaW1lLnN0YWdnZXIoc3RhZ2dlckRlbGF5KSxcbiAgICAgICAgICAgICAgICBiZWdpbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZGViYXJNZW51U2VjdGlvbi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IFswLCAxXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hZGQoe1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJTZWN0aW9uc1Bvc3RNZW51LFxuICAgICAgICAgICAgICAgIGRlbGF5OiBhbmltZS5zdGFnZ2VyKHN0YWdnZXJEZWxheSksXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogWzAsIDFdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndhc0FuaW1hdGVkID0gdHJ1ZTtcblxuICAgICAgICByZXR1cm4gdGltZWxpbmUuZmluaXNoZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xufTtcblxuLyoqXG4gKiBBc3NpZ25zIHRoZSBwYXJlbnQgc2lkZWJhciBlbGVtZW50LCBhbmQgYXR0YWNoZXMgYSBNdXRhdGlvbiBPYnNlcnZlclxuICogd2hpY2ggd2F0Y2hlcyB0aGUgY29hbGxhcHNhYmxlIG5vZGVzIGluc2lkZSBvZiB0aGUgc2lkZWJhciBtZW51XG4gKiBhbmQgYW5pbWF0ZXMgdGhlbSBvbiBjaGVuYWdlc1xuICogXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJlbnRFbGVtZW50IFNpZGViYXJNZW51IHBhcmVudFxuICovXG5TaWRlYmFyRW50cnlBbmltYXRlLnByb3RvdHlwZS5hc3NpZ25QYXJlbnRFbGVtZW50ID0gZnVuY3Rpb24gKHBhcmVudEVsZW1lbnQpIHtcbiAgICB0aGlzLnNpZGViYXJFbGVtZW50ID0gcGFyZW50RWxlbWVudDtcbn07XG5cbi8qKlxuICogRGlzY29ubmVjdHMgdGhlIG9ic2VydmVyXG4gKi9cblNpZGViYXJFbnRyeUFuaW1hdGUucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHsgfTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaWRlYmFyRW50cnlBbmltYXRlOyIsIi8vIERlZmF1bHQgaW1wb3J0IGZpeFxudmFyIGFuaW1lID0gcmVxdWlyZSgnYW5pbWVqcycpLmRlZmF1bHQgP1xuICAgIHJlcXVpcmUoJ2FuaW1lanMnKS5kZWZhdWx0IDogcmVxdWlyZSgnYW5pbWVqcycpO1xuXG52YXIgQU5JTUFUSU9OX0RVUkFUSU9OID0gMTUwO1xudmFyIEFOSU1BVElPTl9TVEVQX09GRlNFVCA9IDAuMTtcblxuZnVuY3Rpb24gU2xpbU1lbnVBbmltYXRlKGNvbmZpZykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLm1vdXNlSW5IYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChfdGhpcy5fYW5pbWF0aW9uc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgdmFyIHRyaWdnZXJFbGVtZW50ID0gdGhpcztcbiAgICAgICAgICAgIHZhciBzdWJNZW51RWxlbWVudCA9IHRyaWdnZXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJzpzY29wZSA+IC5zaWRlYmFyLXN1Ym1lbnUnKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIHRpbWVsaW5lID0gYW5pbWUudGltZWxpbmUoe1xuICAgICAgICAgICAgICAgIHRhcmdldHM6IHN1Yk1lbnVFbGVtZW50LFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBBTklNQVRJT05fRFVSQVRJT04sXG4gICAgICAgICAgICAgICAgYmVnaW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzdWJNZW51RWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAndG9wIGxlZnQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmFkZCh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogWzAsIDFdLFxuICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRDdWJpYycsXG4gICAgICAgICAgICB9KS5hZGQoe1xuICAgICAgICAgICAgICAgIHNjYWxlOiBbMC44LCAxXSxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVZOiBbLTMwLCAwXSxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGVYOiBbLTMwLCAwXSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdlYXNlT3V0RWxhc3RpYygxLjUsIDAuOCknLFxuICAgICAgICAgICAgfSwgQU5JTUFUSU9OX0RVUkFUSU9OICogQU5JTUFUSU9OX1NURVBfT0ZGU0VUKTtcblxuICAgICAgICAgICAgLy8gUmVzZXQgU3R5bGUgb24gRmluaXNoXG4gICAgICAgICAgICB0aW1lbGluZS5maW5pc2hlZC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN1Yk1lbnVFbGVtZW50LnN0eWxlLm9wYWNpdHkgPSAnJztcbiAgICAgICAgICAgICAgICBzdWJNZW51RWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSAnJztcbiAgICAgICAgICAgICAgICBzdWJNZW51RWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAnJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB0aGlzLm1vdXNlT3V0SGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX3RoaXMuX2FuaW1hdGlvbnNFbmFibGVkKCkpIHtcbiAgICAgICAgICAgIHZhciB0cmlnZ2VyRWxlbWVudCA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgc3ViTWVudUVsZW1lbnQgPSB0cmlnZ2VyRWxlbWVudC5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiAuc2lkZWJhci1zdWJtZW51Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB2YXIgdGltZWxpbmUgPSBhbmltZS50aW1lbGluZSh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0czogc3ViTWVudUVsZW1lbnQsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IEFOSU1BVElPTl9EVVJBVElPTixcbiAgICAgICAgICAgICAgICBiZWdpbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Yk1lbnVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBzdWJNZW51RWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnYXV0byc7XG4gICAgICAgICAgICAgICAgICAgIHN1Yk1lbnVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICd0b3AgbGVmdCc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYWRkKHtcbiAgICAgICAgICAgICAgICBzY2FsZTogWzEsIDAuOF0sXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWTogWzAsIC0zMF0sXG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlWDogWzAsIC0zMF0sXG4gICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dEVsYXN0aWMoMS41LCAwLjgpJyxcbiAgICAgICAgICAgIH0pLmFkZCh7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogWzEsIDBdLFxuICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRDdWJpYycsXG4gICAgICAgICAgICB9LCBBTklNQVRJT05fRFVSQVRJT04gKiBBTklNQVRJT05fU1RFUF9PRkZTRVQpO1xuXG4gICAgICAgICAgICAvLyBSZXNldCBTdHlsZSBvbiBGaW5pc2hcbiAgICAgICAgICAgIHRpbWVsaW5lLmZpbmlzaGVkLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc3ViTWVudUVsZW1lbnQuc3R5bGUub3BhY2l0eSA9ICcnO1xuICAgICAgICAgICAgICAgIHN1Yk1lbnVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9ICcnO1xuICAgICAgICAgICAgICAgIHN1Yk1lbnVFbGVtZW50LnN0eWxlLnRyYW5zZm9ybU9yaWdpbiA9ICcnO1xuICAgICAgICAgICAgICAgIHN1Yk1lbnVFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgICAgICBzdWJNZW51RWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuU2xpbU1lbnVBbmltYXRlLnByb3RvdHlwZS5fYW5pbWF0aW9uc0VuYWJsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaWRlYmFyLS1hbmltYXRpb25zLWVuYWJsZWQnKSAmJlxuICAgICAgICAgICAgdGhpcy5fc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaWRlYmFyLS1zbGltJykgJiZcbiAgICAgICAgICAgIHRoaXMuX3NpZGViYXJFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnc2lkZWJhci0tY29sbGFwc2VkJyk7XG59O1xuXG4vKipcbiAqIEFzc2lnbnMgdGhlIHBhcmVudCBzaWRlYmFyIGVsZW1lbnQsIGFuZCBhdHRhY2hlcyBob3ZlciBsaXN0ZW5lcnNcbiAqIFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50RWxlbWVudCBTaWRlYmFyTWVudSBwYXJlbnRcbiAqL1xuU2xpbU1lbnVBbmltYXRlLnByb3RvdHlwZS5hc3NpZ25TaWRlYmFyRWxlbWVudCA9IGZ1bmN0aW9uIChzaWRlYmFyRWxlbWVudCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgX3RoaXMuX3NpZGViYXJFbGVtZW50ID0gc2lkZWJhckVsZW1lbnQ7XG4gICAgX3RoaXMuX3RyaWdnZXJFbGVtZW50cyA9IEFycmF5LmZyb20oXG4gICAgICAgIF90aGlzLl9zaWRlYmFyRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5zaWRlYmFyLW1lbnUgLnNpZGViYXItbWVudV9fZW50cnkuc2lkZWJhci1tZW51X19lbnRyeS0tbmVzdGVkJ1xuICAgICAgICApXG4gICAgKTtcbiAgICBfdGhpcy5fdHJpZ2dlckVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKHRyaWdnZXJFbGVtZW50KSB7XG4gICAgICAgIHRyaWdnZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBfdGhpcy5tb3VzZUluSGFuZGxlcik7XG4gICAgICAgIHRyaWdnZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBfdGhpcy5tb3VzZU91dEhhbmRsZXIpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBEaXNjb25uZWN0cyB0aGUgbGlzdGVuZXJzXG4gKi9cblNsaW1NZW51QW5pbWF0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgX3RoaXMuX3RyaWdnZXJFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uICh0cmlnZ2VyRWxlbWVudCkge1xuICAgICAgICB0cmlnZ2VyRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgX3RoaXMubW91c2VJbkhhbmRsZXIpO1xuICAgICAgICB0cmlnZ2VyRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgX3RoaXMubW91c2VPdXRIYW5kbGVyKTtcbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2xpbU1lbnVBbmltYXRlO1xuIiwidmFyIGFuaW1lID0gcmVxdWlyZSgnYW5pbWVqcycpLmRlZmF1bHQgPyByZXF1aXJlKCdhbmltZWpzJykuZGVmYXVsdCA6IHJlcXVpcmUoJ2FuaW1lanMnKTtcblxuZnVuY3Rpb24gU2xpbVNpZGViYXJBbmltYXRlKG9wdGlvbnMpIHtcbiAgICB2YXIgdGltZWxpbmVTdGFnZTEsXG4gICAgICAgIHRpbWVsaW5lU3RhZ2UyO1xuICAgIHZhciBpc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIHZhciBjb25maWcgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgIHNpZGViYXJXaWR0aDogMjUwLFxuICAgICAgICBzaWRlYmFyU2xpbVdpZHRoOiA2MCxcbiAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IDQwMCxcbiAgICAgICAgYW5pbWF0aW9uU3RhZ2dlckRlbGF5OiAxMCxcbiAgICAgICAgYW5pbWF0aW9uRWFzaW5nOiAnZWFzZUluUXVhZCcgICAgICAgIFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgZnVuY3Rpb24gYnVpbGRUaW1lbGluZShiZWdpbkNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhbmltZS50aW1lbGluZSh7XG4gICAgICAgICAgICBlYXNpbmc6IGNvbmZpZy5hbmltYXRpb25FYXNpbmcsXG4gICAgICAgICAgICBkdXJhdGlvbjogY29uZmlnLmFuaW1hdGlvbkR1cmF0aW9uIC8gMixcbiAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgIGJlZ2luOiBiZWdpbkNhbGxiYWNrIHx8IGZ1bmN0aW9uKCkgeyB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX25vZGVzT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgICAgIHZhciBtdXRhdGlvbiA9IG11dGF0aW9uc1swXTtcbiAgICAgICAgdmFyIGFuaW1hdGlvbkhhbGZUaW1lID0gY29uZmlnLmFuaW1hdGlvbkR1cmF0aW9uIC8gMjtcbiAgICAgICAgdmFyIHNpZGViYXJFbGVtZW50ID0gbXV0YXRpb24udGFyZ2V0O1xuICAgICAgICB2YXIgbGF5b3V0U2lkZWJhcldyYXAgPSBzaWRlYmFyRWxlbWVudC5jbG9zZXN0KCcubGF5b3V0X19zaWRlYmFyJyk7XG4gICAgICAgIHZhciBzaWRlYmFyTWVudSA9IHNpZGViYXJFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlYmFyLW1lbnUnKTtcbiAgICAgICAgdmFyIHNpZGViYXJMYWJlbHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgJy5zaWRlYmFyLW1lbnVfX2VudHJ5X19saW5rID4gc3BhbiwgJyArXG4gICAgICAgICAgICAnLnNpZGViYXItc3VibWVudV9fZW50cnlfX2xpbmsgPiBzcGFuJ1xuICAgICAgICApO1xuICAgICAgICB2YXIgc2lkZWJhckljb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXItbWVudV9fZW50cnlfX2ljb24nKTtcbiAgICAgICAgdmFyIHNpZGViYXJIaWRlU2xpbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyX19oaWRlLXNsaW0nKTtcbiAgICAgICAgdmFyIHNpZGViYXJTaG93U2xpbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zaWRlYmFyX19zaG93LXNsaW0nKTtcblxuICAgICAgICB2YXIgaXNTaWRlYmFyU2xpbSA9IHNpZGViYXJFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnc2lkZWJhci0tc2xpbScpO1xuICAgICAgICB2YXIgaXNTaWRlYmFyQ29sbGFwc2VkID0gc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdzaWRlYmFyLS1jb2xsYXBzZWQnKTtcbiAgICAgICAgdmFyIGxhc3RTaWRlYmFyU2xpbSA9IG11dGF0aW9uLm9sZFZhbHVlLmluZGV4T2YoJ3NpZGViYXItLXNsaW0nKSA+PSAwO1xuICAgICAgICB2YXIgbGFzdFNpZGViYXJDb2xsYXBzZWQgPSBtdXRhdGlvbi5vbGRWYWx1ZS5pbmRleE9mKCdzaWRlYmFyLS1jb2xsYXBzZWQnKSA+PSAwO1xuICAgICAgICBcbiAgICAgICAgLy8gRmluaXNoIHByZXZpb3VzIGFuaW1hdGlvbnMgaWYgdGhleSBleGlzdFxuICAgICAgICBpZiAodGltZWxpbmVTdGFnZTEgJiYgdGltZWxpbmVTdGFnZTEuaXNBbmltYXRpbmcpIHsgdGltZWxpbmVTdGFnZTEuY29tcGxldGUoKTsgfVxuICAgICAgICBpZiAodGltZWxpbmVTdGFnZTIgJiYgdGltZWxpbmVTdGFnZTIuaXNBbmltYXRpbmcpIHsgdGltZWxpbmVTdGFnZTIuY29tcGxldGUoKTsgfVxuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIChpc1NpZGViYXJTbGltIHx8IGxhc3RTaWRlYmFyU2xpbSkgJiZcbiAgICAgICAgICAgIChpc1NpZGViYXJDb2xsYXBzZWQgIT09IGxhc3RTaWRlYmFyQ29sbGFwc2VkKSAmJlxuICAgICAgICAgICAgIWlzQW5pbWF0aW5nXG4gICAgICAgICkge1xuICAgICAgICAgICAgaXNBbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoaXNTaWRlYmFyQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVjb3ZlciB0aGUgY2hhbmdlZCBjbGFzcyBzbyB0aGUgYW5pbWF0aW9uXG4gICAgICAgICAgICAgICAgLy8gY2FuIGJlIHBsYXllZCBzbW9vdGhseVxuICAgICAgICAgICAgICAgIHNpZGViYXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ3NpZGViYXItLWNvbGxhcHNlZCcpO1xuICAgICAgICAgICAgICAgIC8vIFNUQUdFIDE6IEhpZGUgRGVmYXVsdFxuICAgICAgICAgICAgICAgIHRpbWVsaW5lU3RhZ2UxID0gYnVpbGRUaW1lbGluZSgpXG4gICAgICAgICAgICAgICAgICAgIC5hZGQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTW92ZSB0aGUgc2lkZWJhciBvZmYgc2NyZWVuIGFuZCBsZWF2ZSBvbmx5IHRoZSBcInNsaW1cIiBwYXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRzOiBzaWRlYmFyRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IC0oY29uZmlnLnNpZGViYXJXaWR0aCAtIGNvbmZpZy5zaWRlYmFyU2xpbVdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNsYXNzIGhpZGVzIDo6YWZ0ZXIgY2FyZXRzIGFuZCBmYWRlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3RpdmUgaGlnaGxpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2lkZWJhci0tYW5pbWF0ZS1zbGltLS1wcm9ncmVzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhpZGUgdGhlIG1lbnUgZW50cmllcyB0aXRsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBzdHlsZSBvZiB0aXRsZXMgdXBvbiBjb21wbGV0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSB7IGxhYmVsLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhpZGUgc2VjdGlvbnMgd2hpY2ggYXJlIHZpc2libGUgaW4gZGVmYXVsdCBzaWRlYmFyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRzOiBzaWRlYmFySGlkZVNsaW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIC8vIFNUQUdFIDI6IFNob3cgU2xpbVxuICAgICAgICAgICAgICAgIHRpbWVsaW5lU3RhZ2UyID0gYnVpbGRUaW1lbGluZSgpXG4gICAgICAgICAgICAgICAgICAgIC5hZGQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ3JlYXRlIGEgZmFkZS1pbiBhbmQgZW50cnkgZnJvbSBsZWZ0IG9mIHNsaW0gaWNvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJJY29ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IFswLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zbGF0ZVg6IFstY29uZmlnLnNpZGViYXJTbGltV2lkdGgsIDBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGFuaW1lLnN0YWdnZXIoY29uZmlnLmFuaW1hdGlvblN0YWdnZXJEZWxheSksXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmlyc3QgYW5pbWF0aW9uIHN0YWdlIGNvbXBsZXRlLCBtYWtlIHRoZSBzaWRlYmFyIHRydWxseSBzbGltXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2lkZWJhci0tY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2lkZWJhci0tYW5pbWF0ZS1zbGltLS1wcm9ncmVzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IHNpZGViYXIgc3R5bGUgYWZ0ZXIgdGhlIGZpcnN0IHN0YWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlc2V0IEhpZGRlbiBlbGVtZW50cyBzdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFySGlkZVNsaW0uZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7IGVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgaWNvbnMgc3R5bGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckljb25zLmZvckVhY2goZnVuY3Rpb24oaWNvbikgeyBpY29uLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhZGUgaW4gc2VjdGlvbiB2aXNpYmxlIG9ubHkgaW4gc2xpbSBzaWRlYmFyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRzOiBzaWRlYmFyU2hvd1NsaW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBbMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhclNob3dTbGltLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkgeyBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgICAgIC8vIFNUQVJUOiBDaGFpbiBib3RoIHRpbWVsaW5lc1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lU3RhZ2UxLmZpbmlzaGVkLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lU3RhZ2UyLnBsYXkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aW1lbGluZVN0YWdlMi5maW5pc2hlZC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBzdHlsZXMgb2YgbW9kaWZpZWQgc2VjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXJfX3NlY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oc2VjdGlvbikgeyBzZWN0aW9uLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNpZGViYXJFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aW1lbGluZVN0YWdlMS5wbGF5KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFJlY292ZXIgdGhlIHNsaW0gY2xhc3NlcyBzbyB0aGUgYW5pbWF0aW9uIGNhbiBtYWtlXG4gICAgICAgICAgICAgICAgLy8gdGhlIHNtb290aCB0cmFuc2l0aW9uXG4gICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2lkZWJhci0tY29sbGFwc2VkJyk7XG4gICAgICAgICAgICAgICAgc2lkZWJhck1lbnUuY2xhc3NMaXN0LmFkZCgnc2lkZWJhci1tZW51LS1zbGltJyk7XG4gICAgICAgICAgICAgICAgbGF5b3V0U2lkZWJhcldyYXAuY2xhc3NMaXN0LmFkZCgnbGF5b3V0X19zaWRlYmFyLS1zbGltJyk7XG4gICAgICAgICAgICAgICAgLy8gU2V0dXAgdGhlIGFuaW1hdGlvbiBjbGFzc1xuICAgICAgICAgICAgICAgIHNpZGViYXJFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3NpZGViYXItLWFuaW1hdGUtc2xpbS0tcHJvZ3Jlc3MnKTtcbiAgICAgICAgICAgICAgICAvLyBTVEFHRSAxOiBIaWRlIFNsaW1cbiAgICAgICAgICAgICAgICB0aW1lbGluZVN0YWdlMSA9IGJ1aWxkVGltZWxpbmUoKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhpZGUgdGhlIHNsaW0gaWNvbnMgdG8gdGhlIGxlZnQgb2YgdGhlIHNjcmVlbiBhbmQgZmFkZSB0aGVtIG91dFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0czogc2lkZWJhckljb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWDogLWNvbmZpZy5zaWRlYmFyU2xpbVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IGFuaW1hdGlvbkhhbGZUaW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGFuaW1lLnN0YWdnZXIoY29uZmlnLmFuaW1hdGlvblN0YWdnZXJEZWxheSksXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhpZGUgdGhlIHNlY3Rpb25zIHZpc2libGUgb25seSBpbiBzbGltXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRzOiBzaWRlYmFyU2hvd1NsaW0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogYW5pbWF0aW9uSGFsZlRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBbMSwgMF0sXG4gICAgICAgICAgICAgICAgICAgIH0sIDApO1xuXG4gICAgICAgICAgICAgICAgLy8gU1RBR0UgMjogU2hvdyBTbGltXG4gICAgICAgICAgICAgICAgdGltZWxpbmVTdGFnZTIgPSBidWlsZFRpbWVsaW5lKClcbiAgICAgICAgICAgICAgICAgICAgLy8gSEFDSzogU2V0dXAgc3RlcCAtIHRyYW5zbGF0ZVggMCBpcyBzZXQgZm9yIGluaXRpYWwgdHJhbnNmb3JtIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuaW1lanMgc2V0cyB0aGUgdHJhbnNsYXRlIGJ5IHRoZSBmaXJzdCBzdGVwIGluIHRpbWVsaW5lXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoaWNoIHdvcmtzIHdyb25nIHdpdGggcmVtbW92aW5nIHRoZSBjb2xsYXBzZSBjbGFzZXMuIEluIG90aGVyXG4gICAgICAgICAgICAgICAgICAgIC8vIHdvcmRzOiBEb24ndCB0b3VjaCB0aGlzIVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJFbGVtZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVYOiBbMCwgMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFySWNvbnMuZm9yRWFjaChmdW5jdGlvbihpY29uKSB7IGljb24ucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFyU2hvd1NsaW0uZm9yRWFjaChmdW5jdGlvbihpY29uKSB7IGljb24ucmVtb3ZlQXR0cmlidXRlKCdzdHlsZScpOyB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEhpZGUgTGFiZWxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSB7IGxhYmVsLnN0eWxlLm9wYWNpdHkgPSAwOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBNYWtlIHRoZSBzaWRlYmFyIGRlZmF1bHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFyRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdzaWRlYmFyLS1jb2xsYXBzZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFyTWVudS5jbGFzc0xpc3QucmVtb3ZlKCdzaWRlYmFyLW1lbnUtLXNsaW0nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGFuaW1hdGlvbiBjbGFzc2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnc2lkZWJhci0tYW5pbWF0ZS1zbGltLS1wcm9ncmVzcycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNsaWRlIHRoZSBzaWRlYmFyIGJhY2sgdG8gZGVmYXVsdCBwb3NpdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0czogc2lkZWJhckVsZW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogYW5pbWF0aW9uSGFsZlRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgc2lkZWJhciBzdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFyRWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWDogWy0oY29uZmlnLnNpZGViYXJXaWR0aCAtIGNvbmZpZy5zaWRlYmFyU2xpbVdpZHRoKSwgMF0sXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFkZSBpbiB0aGUgU2lkZU1lbnUgZW50cmllcyB0aXRsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJMYWJlbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogYW5pbWF0aW9uSGFsZlRpbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBbMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2lkZWJhckxhYmVscy5mb3JFYWNoKGZ1bmN0aW9uKGxhYmVsKSB7IGxhYmVsLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgICAgICAgICAuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhZGUgaW4gc2VjdGlvbnMgd2hpY2ggYXJlIHZpc2libGUgb25seSBpbiBkZWZhdWx0IHNpZGViYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldHM6IHNpZGViYXJIaWRlU2xpbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiBhbmltYXRpb25IYWxmVGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IFswLCAxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWRlYmFySGlkZVNsaW0uZm9yRWFjaChmdW5jdGlvbihsYWJlbCkgeyBsYWJlbC5yZW1vdmVBdHRyaWJ1dGUoJ3N0eWxlJyk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgICAgICAvLyBTVEFSVDogQ2hhaW4gYm90aCB0aW1lbGluZXNcbiAgICAgICAgICAgICAgICB0aW1lbGluZVN0YWdlMS5maW5pc2hlZC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVN0YWdlMi5wbGF5KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aW1lbGluZVN0YWdlMi5maW5pc2hlZC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAvLyBSZXNldCBzdHlsZXMgb2YgbW9kaWZpZWQgc2VjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNpZGViYXJfX3NlY3Rpb24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oc2VjdGlvbikgeyBzZWN0aW9uLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTsgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVjb3ZlciB0aGUgbGF5b3V0X19zaWRlYmFyIHN0YXRlXG4gICAgICAgICAgICAgICAgICAgIGxheW91dFNpZGViYXJXcmFwLmNsYXNzTGlzdC5yZW1vdmUoJ2xheW91dF9fc2lkZWJhci0tc2xpbScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lU3RhZ2UxLnBsYXkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEFzc2lnbnMgdGhlIHBhcmVudCBzaWRlYmFyIGVsZW1lbnQsIGFuZCBhdHRhY2hlcyBhIE11dGF0aW9uIE9ic2VydmVyXG4gKiB3aGljaCB3YXRjaGVzIHRoZSBjb2FsbGFwc2FibGUgbm9kZXMgaW5zaWRlIG9mIHRoZSBzaWRlYmFyIG1lbnVcbiAqIGFuZCBhbmltYXRlcyB0aGVtIG9uIGNoZW5hZ2VzXG4gKiBcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IHBhcmVudEVsZW1lbnQgU2lkZWJhck1lbnUgcGFyZW50XG4gKi9cblNsaW1TaWRlYmFyQW5pbWF0ZS5wcm90b3R5cGUuYXNzaWduUGFyZW50RWxlbWVudCA9IGZ1bmN0aW9uIChwYXJlbnRFbGVtZW50KSB7XG4gICAgLy8gUmVhc3NpZ24gT2JzZXJ2ZXIgRWxlbWVudFxuICAgIHRoaXMuX25vZGVzT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIHRoaXMuX25vZGVzT2JzZXJ2ZXIub2JzZXJ2ZShwYXJlbnRFbGVtZW50LCB7XG4gICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgIGF0dHJpYnV0ZUZpbHRlcjogWydjbGFzcyddLFxuICAgICAgICBhdHRyaWJ1dGVPbGRWYWx1ZTogdHJ1ZSxcbiAgICAgICAgc3VidHJlZTogZmFsc2VcbiAgICB9KTtcbn07XG5cbi8qKlxuICogRGlzY29ubmVjdHMgdGhlIG9ic2VydmVyXG4gKi9cblNsaW1TaWRlYmFyQW5pbWF0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX25vZGVzT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTbGltU2lkZWJhckFuaW1hdGU7IiwidmFyIFNJWkVTID0gW1xuICAgIHsgc2l6ZTogJ3hzJywgcXVlcnk6ICcobWF4LXdpZHRoOiA1NzUuOHB4KScgfSxcbiAgICB7IHNpemU6ICdzbScsIHF1ZXJ5OiAnKG1pbi13aWR0aDogNTc2cHgpIGFuZCAobWF4LXdpZHRoOiA3NjcuOHB4KScgfSxcbiAgICB7IHNpemU6ICdtZCcsIHF1ZXJ5OiAnKG1pbi13aWR0aDogNzY4cHgpIGFuZCAobWF4LXdpZHRoOiA5OTEuOHB4KScgfSxcbiAgICB7IHNpemU6ICdsZycsIHF1ZXJ5OiAnKG1pbi13aWR0aDogOTkycHgpIGFuZCAobWF4LXdpZHRoOiAxMTk5LjhweCknIH0sXG4gICAgeyBzaXplOiAneGwnLCBxdWVyeTogJyhtaW4td2lkdGg6IDEyMDBweCknIH0sXG5dO1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50QnNTY3JlZW5TaXplKCkge1xuICAgIHZhciBzY3JlZW5TaXplID0gJ3hsJztcblxuICAgIFNJWkVTLmZvckVhY2goZnVuY3Rpb24oc2l6ZURlZikge1xuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEoc2l6ZURlZi5xdWVyeSkubWF0Y2hlcykge1xuICAgICAgICAgICAgc2NyZWVuU2l6ZSA9IHNpemVEZWYuc2l6ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNjcmVlblNpemU7XG59XG5cbmZ1bmN0aW9uIGlzRWxlbWVudEluQ29sbGFwc2VkTmF2YmFyKGVsZW1lbnQpIHtcbiAgICB2YXIgbmF2YmFyID0gZWxlbWVudC5jbG9zZXN0KCcubmF2YmFyJyk7XG4gICAgdmFyIGNvbGxhcHNlID0gZWxlbWVudC5jbG9zZXN0KCcubmF2YmFyLWNvbGxhcHNlJyk7XG5cbiAgICBpZiAobmF2YmFyICYmIGNvbGxhcHNlKSB7XG4gICAgICAgIHZhciBjdXJyZW50U2NyZWVuU2l6ZSA9IGdldEN1cnJlbnRCc1NjcmVlblNpemUoKTtcbiAgICAgICAgdmFyIG5hdmJhckNsYXNzZXMgPSBuYXZiYXIuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYXZiYXJDbGFzc2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gbmF2YmFyQ2xhc3Nlc1tpXTtcbiAgICAgICAgICAgIC8vIEF2b2lkIFJlZ2V4cCBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID09PSAnbmF2YmFyLWV4cGFuZC14cycgfHxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPT09ICduYXZiYXItZXhwYW5kLXNtJyB8fFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9PT0gJ25hdmJhci1leHBhbmQtbWQnIHx8XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID09PSAnbmF2YmFyLWV4cGFuZC1sZycgfHxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPT09ICduYXZiYXItZXhwYW5kLXhsJ1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbGxhcHNlU2l6ZSA9IGNsYXNzTmFtZS5yZXBsYWNlKCduYXZiYXItZXhwYW5kLScsICcnKTtcbiAgICAgICAgICAgICAgICB2YXIgY29sbGFwc2VTaXplSW5kZXggPSBTSVpFUy5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChzaXplRGVmKSB7IHJldHVybiBzaXplRGVmLnNpemUgPT09IGNvbGxhcHNlU2l6ZTsgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRTY3JlZW5TaXplSW5kZXggPSBTSVpFUy5maW5kSW5kZXgoXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChzaXplRGVmKSB7IHJldHVybiBzaXplRGVmLnNpemUgPT09IGN1cnJlbnRTY3JlZW5TaXplOyB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFNjcmVlblNpemVJbmRleCA8IGNvbGxhcHNlU2l6ZUluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5hdmJhci5jbGFzc0xpc3QuY29udGFpbnMoJ25hdmJhci1leHBhbmQtJyArIGN1cnJlbnRTY3JlZW5TaXplKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGdldEN1cnJlbnRCc1NjcmVlblNpemU6IGdldEN1cnJlbnRCc1NjcmVlblNpemUsXG4gICAgaXNFbGVtZW50SW5Db2xsYXBzZWROYXZiYXI6IGlzRWxlbWVudEluQ29sbGFwc2VkTmF2YmFyLFxufTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIFNpZGVNZW51QW5pbWF0ZSA9IHJlcXVpcmUoJy4vLi4vLi4vX2pzLWNvbW1vbi1tb2R1bGVzL3NpZGUtbWVudS1hbmltYXRlJyk7XG4gICAgdmFyIFNsaW1TaWRlYmFyQW5pbWF0ZSA9IHJlcXVpcmUoJy4vLi4vLi4vX2pzLWNvbW1vbi1tb2R1bGVzL3NsaW0tc2lkZWJhci1hbmltYXRlJyk7XG4gICAgdmFyIFNpZGViYXJFbnRyeUFuaW1hdGUgPSByZXF1aXJlKCcuLy4uLy4uL19qcy1jb21tb24tbW9kdWxlcy9zaWRlYmFyLWVudHJ5LWFuaW1hdGUnKTtcbiAgICB2YXIgU2xpbU1lbnVBbmltYXRlID0gcmVxdWlyZSgnLi8uLi8uLi9fanMtY29tbW9uLW1vZHVsZXMvc2xpbS1tZW51LWFuaW1hdGUnKTtcbiAgICB2YXIgRHJvcGRvd25NZW51QW5pbWF0ZSA9IHJlcXVpcmUoJy4vLi4vLi4vX2pzLWNvbW1vbi1tb2R1bGVzL2Ryb3Bkb3duLW1lbnUtYW5pbWF0ZScpO1xuICAgIHZhciBOZXN0ZWREcm9wZG93bkFuaW1hdGUgPSByZXF1aXJlKCcuLy4uLy4uL19qcy1jb21tb24tbW9kdWxlcy9uZXN0ZWQtZHJvcGRvd24tYW5pbWF0ZScpO1xuXG4gICAgdmFyIHNpZGViYXJFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXInKTtcbiAgICB2YXIgc2lkZU1lbnVFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGViYXIgLnNpZGViYXItbWVudScpO1xuICAgIHZhciBkcm9wZG93bk1lbnVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRyb3Bkb3duLW1lbnUnKTtcbiAgICB2YXIgbmVzdGVkRHJvcGRvd25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLm5lc3RlZC1kcm9wZG93bicpO1xuXG4gICAgaWYgKHNpZGVNZW51RWxlbWVudCkge1xuICAgICAgICB2YXIgc2lkZU1lbnVBbmltYXRlID0gbmV3IFNpZGVNZW51QW5pbWF0ZSgpO1xuXG4gICAgICAgIHNpZGVNZW51QW5pbWF0ZS5hc3NpZ25QYXJlbnRFbGVtZW50KHNpZGVNZW51RWxlbWVudCk7XG4gICAgfVxuXG4gICAgaWYgKHNpZGViYXJFbGVtZW50KSB7XG4gICAgICAgIHZhciBzbGltU2lkZWJhckFuaW1hdGUgPSBuZXcgU2xpbVNpZGViYXJBbmltYXRlKCk7XG4gICAgICAgIHZhciBzaWRlYmFyRW50cnlBbmltYXRlID0gbmV3IFNpZGViYXJFbnRyeUFuaW1hdGUoeyBkdXJhdGlvbjogMjAwIH0pO1xuICAgICAgICB2YXIgc2xpbU1lbnVBbmltYXRlID0gbmV3IFNsaW1NZW51QW5pbWF0ZSgpO1xuXG4gICAgICAgIHNsaW1TaWRlYmFyQW5pbWF0ZS5hc3NpZ25QYXJlbnRFbGVtZW50KHNpZGViYXJFbGVtZW50KTtcbiAgICAgICAgc2lkZWJhckVudHJ5QW5pbWF0ZS5hc3NpZ25QYXJlbnRFbGVtZW50KHNpZGViYXJFbGVtZW50KTtcbiAgICAgICAgc2xpbU1lbnVBbmltYXRlLmFzc2lnblNpZGViYXJFbGVtZW50KHNpZGViYXJFbGVtZW50KTtcblxuICAgICAgICBzaWRlYmFyRW50cnlBbmltYXRlLmV4ZWN1dGVBbmltYXRpb24oKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2lkZWJhckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnc2lkZWJhci0tYW5pbWF0ZS1lbnRyeS1jb21wbGV0ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKGRyb3Bkb3duTWVudXMgJiYgZHJvcGRvd25NZW51cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBkcm9wZG93bk1lbnVBbmltYXRlID0gbmV3IERyb3Bkb3duTWVudUFuaW1hdGUoKTtcblxuICAgICAgICBkcm9wZG93bk1lbnVBbmltYXRlLmluaXRpYWxpemVXYXRjaGVyKGRyb3Bkb3duTWVudXMpO1xuICAgIH1cblxuICAgIGlmIChuZXN0ZWREcm9wZG93bnMgJiYgbmVzdGVkRHJvcGRvd25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG5lc3RlZERyb3Bkb3duQW5pbWF0ZSA9IG5ldyBOZXN0ZWREcm9wZG93bkFuaW1hdGUoKTtcblxuICAgICAgICBuZXN0ZWREcm9wZG93bkFuaW1hdGUuaW5pdGlhbGl6ZShuZXN0ZWREcm9wZG93bnMpO1xuICAgIH1cbn0pKCk7IiwiLypcbiAqIGFuaW1lLmpzIHYzLjEuMFxuICogKGMpIDIwMTkgSnVsaWFuIEdhcm5pZXJcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogYW5pbWVqcy5jb21cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIERlZmF1bHRzXG5cbnZhciBkZWZhdWx0SW5zdGFuY2VTZXR0aW5ncyA9IHtcbiAgdXBkYXRlOiBudWxsLFxuICBiZWdpbjogbnVsbCxcbiAgbG9vcEJlZ2luOiBudWxsLFxuICBjaGFuZ2VCZWdpbjogbnVsbCxcbiAgY2hhbmdlOiBudWxsLFxuICBjaGFuZ2VDb21wbGV0ZTogbnVsbCxcbiAgbG9vcENvbXBsZXRlOiBudWxsLFxuICBjb21wbGV0ZTogbnVsbCxcbiAgbG9vcDogMSxcbiAgZGlyZWN0aW9uOiAnbm9ybWFsJyxcbiAgYXV0b3BsYXk6IHRydWUsXG4gIHRpbWVsaW5lT2Zmc2V0OiAwXG59O1xuXG52YXIgZGVmYXVsdFR3ZWVuU2V0dGluZ3MgPSB7XG4gIGR1cmF0aW9uOiAxMDAwLFxuICBkZWxheTogMCxcbiAgZW5kRGVsYXk6IDAsXG4gIGVhc2luZzogJ2Vhc2VPdXRFbGFzdGljKDEsIC41KScsXG4gIHJvdW5kOiAwXG59O1xuXG52YXIgdmFsaWRUcmFuc2Zvcm1zID0gWyd0cmFuc2xhdGVYJywgJ3RyYW5zbGF0ZVknLCAndHJhbnNsYXRlWicsICdyb3RhdGUnLCAncm90YXRlWCcsICdyb3RhdGVZJywgJ3JvdGF0ZVonLCAnc2NhbGUnLCAnc2NhbGVYJywgJ3NjYWxlWScsICdzY2FsZVonLCAnc2tldycsICdza2V3WCcsICdza2V3WScsICdwZXJzcGVjdGl2ZSddO1xuXG4vLyBDYWNoaW5nXG5cbnZhciBjYWNoZSA9IHtcbiAgQ1NTOiB7fSxcbiAgc3ByaW5nczoge31cbn07XG5cbi8vIFV0aWxzXG5cbmZ1bmN0aW9uIG1pbk1heCh2YWwsIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heCh2YWwsIG1pbiksIG1heCk7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ0NvbnRhaW5zKHN0ciwgdGV4dCkge1xuICByZXR1cm4gc3RyLmluZGV4T2YodGV4dCkgPiAtMTtcbn1cblxuZnVuY3Rpb24gYXBwbHlBcmd1bWVudHMoZnVuYywgYXJncykge1xuICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbn1cblxudmFyIGlzID0ge1xuICBhcnI6IGZ1bmN0aW9uIChhKSB7IHJldHVybiBBcnJheS5pc0FycmF5KGEpOyB9LFxuICBvYmo6IGZ1bmN0aW9uIChhKSB7IHJldHVybiBzdHJpbmdDb250YWlucyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSksICdPYmplY3QnKTsgfSxcbiAgcHRoOiBmdW5jdGlvbiAoYSkgeyByZXR1cm4gaXMub2JqKGEpICYmIGEuaGFzT3duUHJvcGVydHkoJ3RvdGFsTGVuZ3RoJyk7IH0sXG4gIHN2ZzogZnVuY3Rpb24gKGEpIHsgcmV0dXJuIGEgaW5zdGFuY2VvZiBTVkdFbGVtZW50OyB9LFxuICBpbnA6IGZ1bmN0aW9uIChhKSB7IHJldHVybiBhIGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudDsgfSxcbiAgZG9tOiBmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5ub2RlVHlwZSB8fCBpcy5zdmcoYSk7IH0sXG4gIHN0cjogZnVuY3Rpb24gKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAnc3RyaW5nJzsgfSxcbiAgZm5jOiBmdW5jdGlvbiAoYSkgeyByZXR1cm4gdHlwZW9mIGEgPT09ICdmdW5jdGlvbic7IH0sXG4gIHVuZDogZnVuY3Rpb24gKGEpIHsgcmV0dXJuIHR5cGVvZiBhID09PSAndW5kZWZpbmVkJzsgfSxcbiAgaGV4OiBmdW5jdGlvbiAoYSkgeyByZXR1cm4gLyheI1swLTlBLUZdezZ9JCl8KF4jWzAtOUEtRl17M30kKS9pLnRlc3QoYSk7IH0sXG4gIHJnYjogZnVuY3Rpb24gKGEpIHsgcmV0dXJuIC9ecmdiLy50ZXN0KGEpOyB9LFxuICBoc2w6IGZ1bmN0aW9uIChhKSB7IHJldHVybiAvXmhzbC8udGVzdChhKTsgfSxcbiAgY29sOiBmdW5jdGlvbiAoYSkgeyByZXR1cm4gKGlzLmhleChhKSB8fCBpcy5yZ2IoYSkgfHwgaXMuaHNsKGEpKTsgfSxcbiAga2V5OiBmdW5jdGlvbiAoYSkgeyByZXR1cm4gIWRlZmF1bHRJbnN0YW5jZVNldHRpbmdzLmhhc093blByb3BlcnR5KGEpICYmICFkZWZhdWx0VHdlZW5TZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShhKSAmJiBhICE9PSAndGFyZ2V0cycgJiYgYSAhPT0gJ2tleWZyYW1lcyc7IH1cbn07XG5cbi8vIEVhc2luZ3NcblxuZnVuY3Rpb24gcGFyc2VFYXNpbmdQYXJhbWV0ZXJzKHN0cmluZykge1xuICB2YXIgbWF0Y2ggPSAvXFwoKFteKV0rKVxcKS8uZXhlYyhzdHJpbmcpO1xuICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS5zcGxpdCgnLCcpLm1hcChmdW5jdGlvbiAocCkgeyByZXR1cm4gcGFyc2VGbG9hdChwKTsgfSkgOiBbXTtcbn1cblxuLy8gU3ByaW5nIHNvbHZlciBpbnNwaXJlZCBieSBXZWJraXQgQ29weXJpZ2h0IMKpIDIwMTYgQXBwbGUgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBodHRwczovL3dlYmtpdC5vcmcvZGVtb3Mvc3ByaW5nL3NwcmluZy5qc1xuXG5mdW5jdGlvbiBzcHJpbmcoc3RyaW5nLCBkdXJhdGlvbikge1xuXG4gIHZhciBwYXJhbXMgPSBwYXJzZUVhc2luZ1BhcmFtZXRlcnMoc3RyaW5nKTtcbiAgdmFyIG1hc3MgPSBtaW5NYXgoaXMudW5kKHBhcmFtc1swXSkgPyAxIDogcGFyYW1zWzBdLCAuMSwgMTAwKTtcbiAgdmFyIHN0aWZmbmVzcyA9IG1pbk1heChpcy51bmQocGFyYW1zWzFdKSA/IDEwMCA6IHBhcmFtc1sxXSwgLjEsIDEwMCk7XG4gIHZhciBkYW1waW5nID0gbWluTWF4KGlzLnVuZChwYXJhbXNbMl0pID8gMTAgOiBwYXJhbXNbMl0sIC4xLCAxMDApO1xuICB2YXIgdmVsb2NpdHkgPSAgbWluTWF4KGlzLnVuZChwYXJhbXNbM10pID8gMCA6IHBhcmFtc1szXSwgLjEsIDEwMCk7XG4gIHZhciB3MCA9IE1hdGguc3FydChzdGlmZm5lc3MgLyBtYXNzKTtcbiAgdmFyIHpldGEgPSBkYW1waW5nIC8gKDIgKiBNYXRoLnNxcnQoc3RpZmZuZXNzICogbWFzcykpO1xuICB2YXIgd2QgPSB6ZXRhIDwgMSA/IHcwICogTWF0aC5zcXJ0KDEgLSB6ZXRhICogemV0YSkgOiAwO1xuICB2YXIgYSA9IDE7XG4gIHZhciBiID0gemV0YSA8IDEgPyAoemV0YSAqIHcwICsgLXZlbG9jaXR5KSAvIHdkIDogLXZlbG9jaXR5ICsgdzA7XG5cbiAgZnVuY3Rpb24gc29sdmVyKHQpIHtcbiAgICB2YXIgcHJvZ3Jlc3MgPSBkdXJhdGlvbiA/IChkdXJhdGlvbiAqIHQpIC8gMTAwMCA6IHQ7XG4gICAgaWYgKHpldGEgPCAxKSB7XG4gICAgICBwcm9ncmVzcyA9IE1hdGguZXhwKC1wcm9ncmVzcyAqIHpldGEgKiB3MCkgKiAoYSAqIE1hdGguY29zKHdkICogcHJvZ3Jlc3MpICsgYiAqIE1hdGguc2luKHdkICogcHJvZ3Jlc3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvZ3Jlc3MgPSAoYSArIGIgKiBwcm9ncmVzcykgKiBNYXRoLmV4cCgtcHJvZ3Jlc3MgKiB3MCk7XG4gICAgfVxuICAgIGlmICh0ID09PSAwIHx8IHQgPT09IDEpIHsgcmV0dXJuIHQ7IH1cbiAgICByZXR1cm4gMSAtIHByb2dyZXNzO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0RHVyYXRpb24oKSB7XG4gICAgdmFyIGNhY2hlZCA9IGNhY2hlLnNwcmluZ3Nbc3RyaW5nXTtcbiAgICBpZiAoY2FjaGVkKSB7IHJldHVybiBjYWNoZWQ7IH1cbiAgICB2YXIgZnJhbWUgPSAxLzY7XG4gICAgdmFyIGVsYXBzZWQgPSAwO1xuICAgIHZhciByZXN0ID0gMDtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBlbGFwc2VkICs9IGZyYW1lO1xuICAgICAgaWYgKHNvbHZlcihlbGFwc2VkKSA9PT0gMSkge1xuICAgICAgICByZXN0Kys7XG4gICAgICAgIGlmIChyZXN0ID49IDE2KSB7IGJyZWFrOyB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN0ID0gMDtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGR1cmF0aW9uID0gZWxhcHNlZCAqIGZyYW1lICogMTAwMDtcbiAgICBjYWNoZS5zcHJpbmdzW3N0cmluZ10gPSBkdXJhdGlvbjtcbiAgICByZXR1cm4gZHVyYXRpb247XG4gIH1cblxuICByZXR1cm4gZHVyYXRpb24gPyBzb2x2ZXIgOiBnZXREdXJhdGlvbjtcblxufVxuXG4vLyBCYXNpYyBzdGVwcyBlYXNpbmcgaW1wbGVtZW50YXRpb24gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZnIvZG9jcy9XZWIvQ1NTL3RyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uXG5cbmZ1bmN0aW9uIHN0ZXBzKHN0ZXBzKSB7XG4gIGlmICggc3RlcHMgPT09IHZvaWQgMCApIHN0ZXBzID0gMTA7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICh0KSB7IHJldHVybiBNYXRoLnJvdW5kKHQgKiBzdGVwcykgKiAoMSAvIHN0ZXBzKTsgfTtcbn1cblxuLy8gQmV6aWVyRWFzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmUvYmV6aWVyLWVhc2luZ1xuXG52YXIgYmV6aWVyID0gKGZ1bmN0aW9uICgpIHtcblxuICB2YXIga1NwbGluZVRhYmxlU2l6ZSA9IDExO1xuICB2YXIga1NhbXBsZVN0ZXBTaXplID0gMS4wIC8gKGtTcGxpbmVUYWJsZVNpemUgLSAxLjApO1xuXG4gIGZ1bmN0aW9uIEEoYUExLCBhQTIpIHsgcmV0dXJuIDEuMCAtIDMuMCAqIGFBMiArIDMuMCAqIGFBMSB9XG4gIGZ1bmN0aW9uIEIoYUExLCBhQTIpIHsgcmV0dXJuIDMuMCAqIGFBMiAtIDYuMCAqIGFBMSB9XG4gIGZ1bmN0aW9uIEMoYUExKSAgICAgIHsgcmV0dXJuIDMuMCAqIGFBMSB9XG5cbiAgZnVuY3Rpb24gY2FsY0JlemllcihhVCwgYUExLCBhQTIpIHsgcmV0dXJuICgoQShhQTEsIGFBMikgKiBhVCArIEIoYUExLCBhQTIpKSAqIGFUICsgQyhhQTEpKSAqIGFUIH1cbiAgZnVuY3Rpb24gZ2V0U2xvcGUoYVQsIGFBMSwgYUEyKSB7IHJldHVybiAzLjAgKiBBKGFBMSwgYUEyKSAqIGFUICogYVQgKyAyLjAgKiBCKGFBMSwgYUEyKSAqIGFUICsgQyhhQTEpIH1cblxuICBmdW5jdGlvbiBiaW5hcnlTdWJkaXZpZGUoYVgsIGFBLCBhQiwgbVgxLCBtWDIpIHtcbiAgICB2YXIgY3VycmVudFgsIGN1cnJlbnRULCBpID0gMDtcbiAgICBkbyB7XG4gICAgICBjdXJyZW50VCA9IGFBICsgKGFCIC0gYUEpIC8gMi4wO1xuICAgICAgY3VycmVudFggPSBjYWxjQmV6aWVyKGN1cnJlbnRULCBtWDEsIG1YMikgLSBhWDtcbiAgICAgIGlmIChjdXJyZW50WCA+IDAuMCkgeyBhQiA9IGN1cnJlbnRUOyB9IGVsc2UgeyBhQSA9IGN1cnJlbnRUOyB9XG4gICAgfSB3aGlsZSAoTWF0aC5hYnMoY3VycmVudFgpID4gMC4wMDAwMDAxICYmICsraSA8IDEwKTtcbiAgICByZXR1cm4gY3VycmVudFQ7XG4gIH1cblxuICBmdW5jdGlvbiBuZXd0b25SYXBoc29uSXRlcmF0ZShhWCwgYUd1ZXNzVCwgbVgxLCBtWDIpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7ICsraSkge1xuICAgICAgdmFyIGN1cnJlbnRTbG9wZSA9IGdldFNsb3BlKGFHdWVzc1QsIG1YMSwgbVgyKTtcbiAgICAgIGlmIChjdXJyZW50U2xvcGUgPT09IDAuMCkgeyByZXR1cm4gYUd1ZXNzVDsgfVxuICAgICAgdmFyIGN1cnJlbnRYID0gY2FsY0JlemllcihhR3Vlc3NULCBtWDEsIG1YMikgLSBhWDtcbiAgICAgIGFHdWVzc1QgLT0gY3VycmVudFggLyBjdXJyZW50U2xvcGU7XG4gICAgfVxuICAgIHJldHVybiBhR3Vlc3NUO1xuICB9XG5cbiAgZnVuY3Rpb24gYmV6aWVyKG1YMSwgbVkxLCBtWDIsIG1ZMikge1xuXG4gICAgaWYgKCEoMCA8PSBtWDEgJiYgbVgxIDw9IDEgJiYgMCA8PSBtWDIgJiYgbVgyIDw9IDEpKSB7IHJldHVybjsgfVxuICAgIHZhciBzYW1wbGVWYWx1ZXMgPSBuZXcgRmxvYXQzMkFycmF5KGtTcGxpbmVUYWJsZVNpemUpO1xuXG4gICAgaWYgKG1YMSAhPT0gbVkxIHx8IG1YMiAhPT0gbVkyKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtTcGxpbmVUYWJsZVNpemU7ICsraSkge1xuICAgICAgICBzYW1wbGVWYWx1ZXNbaV0gPSBjYWxjQmV6aWVyKGkgKiBrU2FtcGxlU3RlcFNpemUsIG1YMSwgbVgyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRURm9yWChhWCkge1xuXG4gICAgICB2YXIgaW50ZXJ2YWxTdGFydCA9IDA7XG4gICAgICB2YXIgY3VycmVudFNhbXBsZSA9IDE7XG4gICAgICB2YXIgbGFzdFNhbXBsZSA9IGtTcGxpbmVUYWJsZVNpemUgLSAxO1xuXG4gICAgICBmb3IgKDsgY3VycmVudFNhbXBsZSAhPT0gbGFzdFNhbXBsZSAmJiBzYW1wbGVWYWx1ZXNbY3VycmVudFNhbXBsZV0gPD0gYVg7ICsrY3VycmVudFNhbXBsZSkge1xuICAgICAgICBpbnRlcnZhbFN0YXJ0ICs9IGtTYW1wbGVTdGVwU2l6ZTtcbiAgICAgIH1cblxuICAgICAgLS1jdXJyZW50U2FtcGxlO1xuXG4gICAgICB2YXIgZGlzdCA9IChhWCAtIHNhbXBsZVZhbHVlc1tjdXJyZW50U2FtcGxlXSkgLyAoc2FtcGxlVmFsdWVzW2N1cnJlbnRTYW1wbGUgKyAxXSAtIHNhbXBsZVZhbHVlc1tjdXJyZW50U2FtcGxlXSk7XG4gICAgICB2YXIgZ3Vlc3NGb3JUID0gaW50ZXJ2YWxTdGFydCArIGRpc3QgKiBrU2FtcGxlU3RlcFNpemU7XG4gICAgICB2YXIgaW5pdGlhbFNsb3BlID0gZ2V0U2xvcGUoZ3Vlc3NGb3JULCBtWDEsIG1YMik7XG5cbiAgICAgIGlmIChpbml0aWFsU2xvcGUgPj0gMC4wMDEpIHtcbiAgICAgICAgcmV0dXJuIG5ld3RvblJhcGhzb25JdGVyYXRlKGFYLCBndWVzc0ZvclQsIG1YMSwgbVgyKTtcbiAgICAgIH0gZWxzZSBpZiAoaW5pdGlhbFNsb3BlID09PSAwLjApIHtcbiAgICAgICAgcmV0dXJuIGd1ZXNzRm9yVDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBiaW5hcnlTdWJkaXZpZGUoYVgsIGludGVydmFsU3RhcnQsIGludGVydmFsU3RhcnQgKyBrU2FtcGxlU3RlcFNpemUsIG1YMSwgbVgyKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoeCkge1xuICAgICAgaWYgKG1YMSA9PT0gbVkxICYmIG1YMiA9PT0gbVkyKSB7IHJldHVybiB4OyB9XG4gICAgICBpZiAoeCA9PT0gMCB8fCB4ID09PSAxKSB7IHJldHVybiB4OyB9XG4gICAgICByZXR1cm4gY2FsY0JlemllcihnZXRURm9yWCh4KSwgbVkxLCBtWTIpO1xuICAgIH1cblxuICB9XG5cbiAgcmV0dXJuIGJlemllcjtcblxufSkoKTtcblxudmFyIHBlbm5lciA9IChmdW5jdGlvbiAoKSB7XG5cbiAgLy8gQmFzZWQgb24galF1ZXJ5IFVJJ3MgaW1wbGVtZW5hdGlvbiBvZiBlYXNpbmcgZXF1YXRpb25zIGZyb20gUm9iZXJ0IFBlbm5lciAoaHR0cDovL3d3dy5yb2JlcnRwZW5uZXIuY29tL2Vhc2luZylcblxuICB2YXIgZWFzZXMgPSB7IGxpbmVhcjogZnVuY3Rpb24gKCkgeyByZXR1cm4gZnVuY3Rpb24gKHQpIHsgcmV0dXJuIHQ7IH07IH0gfTtcblxuICB2YXIgZnVuY3Rpb25FYXNpbmdzID0ge1xuICAgIFNpbmU6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZ1bmN0aW9uICh0KSB7IHJldHVybiAxIC0gTWF0aC5jb3ModCAqIE1hdGguUEkgLyAyKTsgfTsgfSxcbiAgICBDaXJjOiBmdW5jdGlvbiAoKSB7IHJldHVybiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSAtIE1hdGguc3FydCgxIC0gdCAqIHQpOyB9OyB9LFxuICAgIEJhY2s6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZ1bmN0aW9uICh0KSB7IHJldHVybiB0ICogdCAqICgzICogdCAtIDIpOyB9OyB9LFxuICAgIEJvdW5jZTogZnVuY3Rpb24gKCkgeyByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBwb3cyLCBiID0gNDtcbiAgICAgIHdoaWxlICh0IDwgKCggcG93MiA9IE1hdGgucG93KDIsIC0tYikpIC0gMSkgLyAxMSkge31cbiAgICAgIHJldHVybiAxIC8gTWF0aC5wb3coNCwgMyAtIGIpIC0gNy41NjI1ICogTWF0aC5wb3coKCBwb3cyICogMyAtIDIgKSAvIDIyIC0gdCwgMilcbiAgICB9OyB9LFxuICAgIEVsYXN0aWM6IGZ1bmN0aW9uIChhbXBsaXR1ZGUsIHBlcmlvZCkge1xuICAgICAgaWYgKCBhbXBsaXR1ZGUgPT09IHZvaWQgMCApIGFtcGxpdHVkZSA9IDE7XG4gICAgICBpZiAoIHBlcmlvZCA9PT0gdm9pZCAwICkgcGVyaW9kID0gLjU7XG5cbiAgICAgIHZhciBhID0gbWluTWF4KGFtcGxpdHVkZSwgMSwgMTApO1xuICAgICAgdmFyIHAgPSBtaW5NYXgocGVyaW9kLCAuMSwgMik7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHQpIHtcbiAgICAgICAgcmV0dXJuICh0ID09PSAwIHx8IHQgPT09IDEpID8gdCA6IFxuICAgICAgICAgIC1hICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKSAqIE1hdGguc2luKCgoKHQgLSAxKSAtIChwIC8gKE1hdGguUEkgKiAyKSAqIE1hdGguYXNpbigxIC8gYSkpKSAqIChNYXRoLlBJICogMikpIC8gcCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHZhciBiYXNlRWFzaW5ncyA9IFsnUXVhZCcsICdDdWJpYycsICdRdWFydCcsICdRdWludCcsICdFeHBvJ107XG5cbiAgYmFzZUVhc2luZ3MuZm9yRWFjaChmdW5jdGlvbiAobmFtZSwgaSkge1xuICAgIGZ1bmN0aW9uRWFzaW5nc1tuYW1lXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZ1bmN0aW9uICh0KSB7IHJldHVybiBNYXRoLnBvdyh0LCBpICsgMik7IH07IH07XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKGZ1bmN0aW9uRWFzaW5ncykuZm9yRWFjaChmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBlYXNlSW4gPSBmdW5jdGlvbkVhc2luZ3NbbmFtZV07XG4gICAgZWFzZXNbJ2Vhc2VJbicgKyBuYW1lXSA9IGVhc2VJbjtcbiAgICBlYXNlc1snZWFzZU91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBmdW5jdGlvbiAodCkgeyByZXR1cm4gMSAtIGVhc2VJbihhLCBiKSgxIC0gdCk7IH07IH07XG4gICAgZWFzZXNbJ2Vhc2VJbk91dCcgKyBuYW1lXSA9IGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBmdW5jdGlvbiAodCkgeyByZXR1cm4gdCA8IDAuNSA/IGVhc2VJbihhLCBiKSh0ICogMikgLyAyIDogXG4gICAgICAxIC0gZWFzZUluKGEsIGIpKHQgKiAtMiArIDIpIC8gMjsgfTsgfTtcbiAgfSk7XG5cbiAgcmV0dXJuIGVhc2VzO1xuXG59KSgpO1xuXG5mdW5jdGlvbiBwYXJzZUVhc2luZ3MoZWFzaW5nLCBkdXJhdGlvbikge1xuICBpZiAoaXMuZm5jKGVhc2luZykpIHsgcmV0dXJuIGVhc2luZzsgfVxuICB2YXIgbmFtZSA9IGVhc2luZy5zcGxpdCgnKCcpWzBdO1xuICB2YXIgZWFzZSA9IHBlbm5lcltuYW1lXTtcbiAgdmFyIGFyZ3MgPSBwYXJzZUVhc2luZ1BhcmFtZXRlcnMoZWFzaW5nKTtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSAnc3ByaW5nJyA6IHJldHVybiBzcHJpbmcoZWFzaW5nLCBkdXJhdGlvbik7XG4gICAgY2FzZSAnY3ViaWNCZXppZXInIDogcmV0dXJuIGFwcGx5QXJndW1lbnRzKGJlemllciwgYXJncyk7XG4gICAgY2FzZSAnc3RlcHMnIDogcmV0dXJuIGFwcGx5QXJndW1lbnRzKHN0ZXBzLCBhcmdzKTtcbiAgICBkZWZhdWx0IDogcmV0dXJuIGFwcGx5QXJndW1lbnRzKGVhc2UsIGFyZ3MpO1xuICB9XG59XG5cbi8vIFN0cmluZ3NcblxuZnVuY3Rpb24gc2VsZWN0U3RyaW5nKHN0cikge1xuICB0cnkge1xuICAgIHZhciBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc3RyKTtcbiAgICByZXR1cm4gbm9kZXM7XG4gIH0gY2F0Y2goZSkge1xuICAgIHJldHVybjtcbiAgfVxufVxuXG4vLyBBcnJheXNcblxuZnVuY3Rpb24gZmlsdGVyQXJyYXkoYXJyLCBjYWxsYmFjaykge1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHMubGVuZ3RoID49IDIgPyBhcmd1bWVudHNbMV0gOiB2b2lkIDA7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChpIGluIGFycikge1xuICAgICAgdmFyIHZhbCA9IGFycltpXTtcbiAgICAgIGlmIChjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbCwgaSwgYXJyKSkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuQXJyYXkoYXJyKSB7XG4gIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiBhLmNvbmNhdChpcy5hcnIoYikgPyBmbGF0dGVuQXJyYXkoYikgOiBiKTsgfSwgW10pO1xufVxuXG5mdW5jdGlvbiB0b0FycmF5KG8pIHtcbiAgaWYgKGlzLmFycihvKSkgeyByZXR1cm4gbzsgfVxuICBpZiAoaXMuc3RyKG8pKSB7IG8gPSBzZWxlY3RTdHJpbmcobykgfHwgbzsgfVxuICBpZiAobyBpbnN0YW5jZW9mIE5vZGVMaXN0IHx8IG8gaW5zdGFuY2VvZiBIVE1MQ29sbGVjdGlvbikgeyByZXR1cm4gW10uc2xpY2UuY2FsbChvKTsgfVxuICByZXR1cm4gW29dO1xufVxuXG5mdW5jdGlvbiBhcnJheUNvbnRhaW5zKGFyciwgdmFsKSB7XG4gIHJldHVybiBhcnIuc29tZShmdW5jdGlvbiAoYSkgeyByZXR1cm4gYSA9PT0gdmFsOyB9KTtcbn1cblxuLy8gT2JqZWN0c1xuXG5mdW5jdGlvbiBjbG9uZU9iamVjdChvKSB7XG4gIHZhciBjbG9uZSA9IHt9O1xuICBmb3IgKHZhciBwIGluIG8pIHsgY2xvbmVbcF0gPSBvW3BdOyB9XG4gIHJldHVybiBjbG9uZTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZU9iamVjdFByb3BzKG8xLCBvMikge1xuICB2YXIgbyA9IGNsb25lT2JqZWN0KG8xKTtcbiAgZm9yICh2YXIgcCBpbiBvMSkgeyBvW3BdID0gbzIuaGFzT3duUHJvcGVydHkocCkgPyBvMltwXSA6IG8xW3BdOyB9XG4gIHJldHVybiBvO1xufVxuXG5mdW5jdGlvbiBtZXJnZU9iamVjdHMobzEsIG8yKSB7XG4gIHZhciBvID0gY2xvbmVPYmplY3QobzEpO1xuICBmb3IgKHZhciBwIGluIG8yKSB7IG9bcF0gPSBpcy51bmQobzFbcF0pID8gbzJbcF0gOiBvMVtwXTsgfVxuICByZXR1cm4gbztcbn1cblxuLy8gQ29sb3JzXG5cbmZ1bmN0aW9uIHJnYlRvUmdiYShyZ2JWYWx1ZSkge1xuICB2YXIgcmdiID0gL3JnYlxcKChcXGQrLFxccypbXFxkXSssXFxzKltcXGRdKylcXCkvZy5leGVjKHJnYlZhbHVlKTtcbiAgcmV0dXJuIHJnYiA/IChcInJnYmEoXCIgKyAocmdiWzFdKSArIFwiLDEpXCIpIDogcmdiVmFsdWU7XG59XG5cbmZ1bmN0aW9uIGhleFRvUmdiYShoZXhWYWx1ZSkge1xuICB2YXIgcmd4ID0gL14jPyhbYS1mXFxkXSkoW2EtZlxcZF0pKFthLWZcXGRdKSQvaTtcbiAgdmFyIGhleCA9IGhleFZhbHVlLnJlcGxhY2Uocmd4LCBmdW5jdGlvbiAobSwgciwgZywgYikgeyByZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiOyB9ICk7XG4gIHZhciByZ2IgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcbiAgdmFyIHIgPSBwYXJzZUludChyZ2JbMV0sIDE2KTtcbiAgdmFyIGcgPSBwYXJzZUludChyZ2JbMl0sIDE2KTtcbiAgdmFyIGIgPSBwYXJzZUludChyZ2JbM10sIDE2KTtcbiAgcmV0dXJuIChcInJnYmEoXCIgKyByICsgXCIsXCIgKyBnICsgXCIsXCIgKyBiICsgXCIsMSlcIik7XG59XG5cbmZ1bmN0aW9uIGhzbFRvUmdiYShoc2xWYWx1ZSkge1xuICB2YXIgaHNsID0gL2hzbFxcKChcXGQrKSxcXHMqKFtcXGQuXSspJSxcXHMqKFtcXGQuXSspJVxcKS9nLmV4ZWMoaHNsVmFsdWUpIHx8IC9oc2xhXFwoKFxcZCspLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKyklLFxccyooW1xcZC5dKylcXCkvZy5leGVjKGhzbFZhbHVlKTtcbiAgdmFyIGggPSBwYXJzZUludChoc2xbMV0sIDEwKSAvIDM2MDtcbiAgdmFyIHMgPSBwYXJzZUludChoc2xbMl0sIDEwKSAvIDEwMDtcbiAgdmFyIGwgPSBwYXJzZUludChoc2xbM10sIDEwKSAvIDEwMDtcbiAgdmFyIGEgPSBoc2xbNF0gfHwgMTtcbiAgZnVuY3Rpb24gaHVlMnJnYihwLCBxLCB0KSB7XG4gICAgaWYgKHQgPCAwKSB7IHQgKz0gMTsgfVxuICAgIGlmICh0ID4gMSkgeyB0IC09IDE7IH1cbiAgICBpZiAodCA8IDEvNikgeyByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDsgfVxuICAgIGlmICh0IDwgMS8yKSB7IHJldHVybiBxOyB9XG4gICAgaWYgKHQgPCAyLzMpIHsgcmV0dXJuIHAgKyAocSAtIHApICogKDIvMyAtIHQpICogNjsgfVxuICAgIHJldHVybiBwO1xuICB9XG4gIHZhciByLCBnLCBiO1xuICBpZiAocyA9PSAwKSB7XG4gICAgciA9IGcgPSBiID0gbDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcSA9IGwgPCAwLjUgPyBsICogKDEgKyBzKSA6IGwgKyBzIC0gbCAqIHM7XG4gICAgdmFyIHAgPSAyICogbCAtIHE7XG4gICAgciA9IGh1ZTJyZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgZyA9IGh1ZTJyZ2IocCwgcSwgaCk7XG4gICAgYiA9IGh1ZTJyZ2IocCwgcSwgaCAtIDEvMyk7XG4gIH1cbiAgcmV0dXJuIChcInJnYmEoXCIgKyAociAqIDI1NSkgKyBcIixcIiArIChnICogMjU1KSArIFwiLFwiICsgKGIgKiAyNTUpICsgXCIsXCIgKyBhICsgXCIpXCIpO1xufVxuXG5mdW5jdGlvbiBjb2xvclRvUmdiKHZhbCkge1xuICBpZiAoaXMucmdiKHZhbCkpIHsgcmV0dXJuIHJnYlRvUmdiYSh2YWwpOyB9XG4gIGlmIChpcy5oZXgodmFsKSkgeyByZXR1cm4gaGV4VG9SZ2JhKHZhbCk7IH1cbiAgaWYgKGlzLmhzbCh2YWwpKSB7IHJldHVybiBoc2xUb1JnYmEodmFsKTsgfVxufVxuXG4vLyBVbml0c1xuXG5mdW5jdGlvbiBnZXRVbml0KHZhbCkge1xuICB2YXIgc3BsaXQgPSAvWystXT9cXGQqXFwuP1xcZCsoPzpcXC5cXGQrKT8oPzpbZUVdWystXT9cXGQrKT8oJXxweHxwdHxlbXxyZW18aW58Y218bW18ZXh8Y2h8cGN8dnd8dmh8dm1pbnx2bWF4fGRlZ3xyYWR8dHVybik/JC8uZXhlYyh2YWwpO1xuICBpZiAoc3BsaXQpIHsgcmV0dXJuIHNwbGl0WzFdOyB9XG59XG5cbmZ1bmN0aW9uIGdldFRyYW5zZm9ybVVuaXQocHJvcE5hbWUpIHtcbiAgaWYgKHN0cmluZ0NvbnRhaW5zKHByb3BOYW1lLCAndHJhbnNsYXRlJykgfHwgcHJvcE5hbWUgPT09ICdwZXJzcGVjdGl2ZScpIHsgcmV0dXJuICdweCc7IH1cbiAgaWYgKHN0cmluZ0NvbnRhaW5zKHByb3BOYW1lLCAncm90YXRlJykgfHwgc3RyaW5nQ29udGFpbnMocHJvcE5hbWUsICdza2V3JykpIHsgcmV0dXJuICdkZWcnOyB9XG59XG5cbi8vIFZhbHVlc1xuXG5mdW5jdGlvbiBnZXRGdW5jdGlvblZhbHVlKHZhbCwgYW5pbWF0YWJsZSkge1xuICBpZiAoIWlzLmZuYyh2YWwpKSB7IHJldHVybiB2YWw7IH1cbiAgcmV0dXJuIHZhbChhbmltYXRhYmxlLnRhcmdldCwgYW5pbWF0YWJsZS5pZCwgYW5pbWF0YWJsZS50b3RhbCk7XG59XG5cbmZ1bmN0aW9uIGdldEF0dHJpYnV0ZShlbCwgcHJvcCkge1xuICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlKHByb3ApO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0UHhUb1VuaXQoZWwsIHZhbHVlLCB1bml0KSB7XG4gIHZhciB2YWx1ZVVuaXQgPSBnZXRVbml0KHZhbHVlKTtcbiAgaWYgKGFycmF5Q29udGFpbnMoW3VuaXQsICdkZWcnLCAncmFkJywgJ3R1cm4nXSwgdmFsdWVVbml0KSkgeyByZXR1cm4gdmFsdWU7IH1cbiAgdmFyIGNhY2hlZCA9IGNhY2hlLkNTU1t2YWx1ZSArIHVuaXRdO1xuICBpZiAoIWlzLnVuZChjYWNoZWQpKSB7IHJldHVybiBjYWNoZWQ7IH1cbiAgdmFyIGJhc2VsaW5lID0gMTAwO1xuICB2YXIgdGVtcEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbC50YWdOYW1lKTtcbiAgdmFyIHBhcmVudEVsID0gKGVsLnBhcmVudE5vZGUgJiYgKGVsLnBhcmVudE5vZGUgIT09IGRvY3VtZW50KSkgPyBlbC5wYXJlbnROb2RlIDogZG9jdW1lbnQuYm9keTtcbiAgcGFyZW50RWwuYXBwZW5kQ2hpbGQodGVtcEVsKTtcbiAgdGVtcEVsLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgdGVtcEVsLnN0eWxlLndpZHRoID0gYmFzZWxpbmUgKyB1bml0O1xuICB2YXIgZmFjdG9yID0gYmFzZWxpbmUgLyB0ZW1wRWwub2Zmc2V0V2lkdGg7XG4gIHBhcmVudEVsLnJlbW92ZUNoaWxkKHRlbXBFbCk7XG4gIHZhciBjb252ZXJ0ZWRVbml0ID0gZmFjdG9yICogcGFyc2VGbG9hdCh2YWx1ZSk7XG4gIGNhY2hlLkNTU1t2YWx1ZSArIHVuaXRdID0gY29udmVydGVkVW5pdDtcbiAgcmV0dXJuIGNvbnZlcnRlZFVuaXQ7XG59XG5cbmZ1bmN0aW9uIGdldENTU1ZhbHVlKGVsLCBwcm9wLCB1bml0KSB7XG4gIGlmIChwcm9wIGluIGVsLnN0eWxlKSB7XG4gICAgdmFyIHVwcGVyY2FzZVByb3BOYW1lID0gcHJvcC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCAnJDEtJDInKS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciB2YWx1ZSA9IGVsLnN0eWxlW3Byb3BdIHx8IGdldENvbXB1dGVkU3R5bGUoZWwpLmdldFByb3BlcnR5VmFsdWUodXBwZXJjYXNlUHJvcE5hbWUpIHx8ICcwJztcbiAgICByZXR1cm4gdW5pdCA/IGNvbnZlcnRQeFRvVW5pdChlbCwgdmFsdWUsIHVuaXQpIDogdmFsdWU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0QW5pbWF0aW9uVHlwZShlbCwgcHJvcCkge1xuICBpZiAoaXMuZG9tKGVsKSAmJiAhaXMuaW5wKGVsKSAmJiAoZ2V0QXR0cmlidXRlKGVsLCBwcm9wKSB8fCAoaXMuc3ZnKGVsKSAmJiBlbFtwcm9wXSkpKSB7IHJldHVybiAnYXR0cmlidXRlJzsgfVxuICBpZiAoaXMuZG9tKGVsKSAmJiBhcnJheUNvbnRhaW5zKHZhbGlkVHJhbnNmb3JtcywgcHJvcCkpIHsgcmV0dXJuICd0cmFuc2Zvcm0nOyB9XG4gIGlmIChpcy5kb20oZWwpICYmIChwcm9wICE9PSAndHJhbnNmb3JtJyAmJiBnZXRDU1NWYWx1ZShlbCwgcHJvcCkpKSB7IHJldHVybiAnY3NzJzsgfVxuICBpZiAoZWxbcHJvcF0gIT0gbnVsbCkgeyByZXR1cm4gJ29iamVjdCc7IH1cbn1cblxuZnVuY3Rpb24gZ2V0RWxlbWVudFRyYW5zZm9ybXMoZWwpIHtcbiAgaWYgKCFpcy5kb20oZWwpKSB7IHJldHVybjsgfVxuICB2YXIgc3RyID0gZWwuc3R5bGUudHJhbnNmb3JtIHx8ICcnO1xuICB2YXIgcmVnICA9IC8oXFx3KylcXCgoW14pXSopXFwpL2c7XG4gIHZhciB0cmFuc2Zvcm1zID0gbmV3IE1hcCgpO1xuICB2YXIgbTsgd2hpbGUgKG0gPSByZWcuZXhlYyhzdHIpKSB7IHRyYW5zZm9ybXMuc2V0KG1bMV0sIG1bMl0pOyB9XG4gIHJldHVybiB0cmFuc2Zvcm1zO1xufVxuXG5mdW5jdGlvbiBnZXRUcmFuc2Zvcm1WYWx1ZShlbCwgcHJvcE5hbWUsIGFuaW1hdGFibGUsIHVuaXQpIHtcbiAgdmFyIGRlZmF1bHRWYWwgPSBzdHJpbmdDb250YWlucyhwcm9wTmFtZSwgJ3NjYWxlJykgPyAxIDogMCArIGdldFRyYW5zZm9ybVVuaXQocHJvcE5hbWUpO1xuICB2YXIgdmFsdWUgPSBnZXRFbGVtZW50VHJhbnNmb3JtcyhlbCkuZ2V0KHByb3BOYW1lKSB8fCBkZWZhdWx0VmFsO1xuICBpZiAoYW5pbWF0YWJsZSkge1xuICAgIGFuaW1hdGFibGUudHJhbnNmb3Jtcy5saXN0LnNldChwcm9wTmFtZSwgdmFsdWUpO1xuICAgIGFuaW1hdGFibGUudHJhbnNmb3Jtc1snbGFzdCddID0gcHJvcE5hbWU7XG4gIH1cbiAgcmV0dXJuIHVuaXQgPyBjb252ZXJ0UHhUb1VuaXQoZWwsIHZhbHVlLCB1bml0KSA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBnZXRPcmlnaW5hbFRhcmdldFZhbHVlKHRhcmdldCwgcHJvcE5hbWUsIHVuaXQsIGFuaW1hdGFibGUpIHtcbiAgc3dpdGNoIChnZXRBbmltYXRpb25UeXBlKHRhcmdldCwgcHJvcE5hbWUpKSB7XG4gICAgY2FzZSAndHJhbnNmb3JtJzogcmV0dXJuIGdldFRyYW5zZm9ybVZhbHVlKHRhcmdldCwgcHJvcE5hbWUsIGFuaW1hdGFibGUsIHVuaXQpO1xuICAgIGNhc2UgJ2Nzcyc6IHJldHVybiBnZXRDU1NWYWx1ZSh0YXJnZXQsIHByb3BOYW1lLCB1bml0KTtcbiAgICBjYXNlICdhdHRyaWJ1dGUnOiByZXR1cm4gZ2V0QXR0cmlidXRlKHRhcmdldCwgcHJvcE5hbWUpO1xuICAgIGRlZmF1bHQ6IHJldHVybiB0YXJnZXRbcHJvcE5hbWVdIHx8IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UmVsYXRpdmVWYWx1ZSh0bywgZnJvbSkge1xuICB2YXIgb3BlcmF0b3IgPSAvXihcXCo9fFxcKz18LT0pLy5leGVjKHRvKTtcbiAgaWYgKCFvcGVyYXRvcikgeyByZXR1cm4gdG87IH1cbiAgdmFyIHUgPSBnZXRVbml0KHRvKSB8fCAwO1xuICB2YXIgeCA9IHBhcnNlRmxvYXQoZnJvbSk7XG4gIHZhciB5ID0gcGFyc2VGbG9hdCh0by5yZXBsYWNlKG9wZXJhdG9yWzBdLCAnJykpO1xuICBzd2l0Y2ggKG9wZXJhdG9yWzBdWzBdKSB7XG4gICAgY2FzZSAnKyc6IHJldHVybiB4ICsgeSArIHU7XG4gICAgY2FzZSAnLSc6IHJldHVybiB4IC0geSArIHU7XG4gICAgY2FzZSAnKic6IHJldHVybiB4ICogeSArIHU7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVWYWx1ZSh2YWwsIHVuaXQpIHtcbiAgaWYgKGlzLmNvbCh2YWwpKSB7IHJldHVybiBjb2xvclRvUmdiKHZhbCk7IH1cbiAgaWYgKC9cXHMvZy50ZXN0KHZhbCkpIHsgcmV0dXJuIHZhbDsgfVxuICB2YXIgb3JpZ2luYWxVbml0ID0gZ2V0VW5pdCh2YWwpO1xuICB2YXIgdW5pdExlc3MgPSBvcmlnaW5hbFVuaXQgPyB2YWwuc3Vic3RyKDAsIHZhbC5sZW5ndGggLSBvcmlnaW5hbFVuaXQubGVuZ3RoKSA6IHZhbDtcbiAgaWYgKHVuaXQpIHsgcmV0dXJuIHVuaXRMZXNzICsgdW5pdDsgfVxuICByZXR1cm4gdW5pdExlc3M7XG59XG5cbi8vIGdldFRvdGFsTGVuZ3RoKCkgZXF1aXZhbGVudCBmb3IgY2lyY2xlLCByZWN0LCBwb2x5bGluZSwgcG9seWdvbiBhbmQgbGluZSBzaGFwZXNcbi8vIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9TZWJMYW1ibGEvM2UwNTUwYzQ5NmMyMzY3MDk3NDRcblxuZnVuY3Rpb24gZ2V0RGlzdGFuY2UocDEsIHAyKSB7XG4gIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocDIueCAtIHAxLngsIDIpICsgTWF0aC5wb3cocDIueSAtIHAxLnksIDIpKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2lyY2xlTGVuZ3RoKGVsKSB7XG4gIHJldHVybiBNYXRoLlBJICogMiAqIGdldEF0dHJpYnV0ZShlbCwgJ3InKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVjdExlbmd0aChlbCkge1xuICByZXR1cm4gKGdldEF0dHJpYnV0ZShlbCwgJ3dpZHRoJykgKiAyKSArIChnZXRBdHRyaWJ1dGUoZWwsICdoZWlnaHQnKSAqIDIpO1xufVxuXG5mdW5jdGlvbiBnZXRMaW5lTGVuZ3RoKGVsKSB7XG4gIHJldHVybiBnZXREaXN0YW5jZShcbiAgICB7eDogZ2V0QXR0cmlidXRlKGVsLCAneDEnKSwgeTogZ2V0QXR0cmlidXRlKGVsLCAneTEnKX0sIFxuICAgIHt4OiBnZXRBdHRyaWJ1dGUoZWwsICd4MicpLCB5OiBnZXRBdHRyaWJ1dGUoZWwsICd5MicpfVxuICApO1xufVxuXG5mdW5jdGlvbiBnZXRQb2x5bGluZUxlbmd0aChlbCkge1xuICB2YXIgcG9pbnRzID0gZWwucG9pbnRzO1xuICB2YXIgdG90YWxMZW5ndGggPSAwO1xuICB2YXIgcHJldmlvdXNQb3M7XG4gIGZvciAodmFyIGkgPSAwIDsgaSA8IHBvaW50cy5udW1iZXJPZkl0ZW1zOyBpKyspIHtcbiAgICB2YXIgY3VycmVudFBvcyA9IHBvaW50cy5nZXRJdGVtKGkpO1xuICAgIGlmIChpID4gMCkgeyB0b3RhbExlbmd0aCArPSBnZXREaXN0YW5jZShwcmV2aW91c1BvcywgY3VycmVudFBvcyk7IH1cbiAgICBwcmV2aW91c1BvcyA9IGN1cnJlbnRQb3M7XG4gIH1cbiAgcmV0dXJuIHRvdGFsTGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBnZXRQb2x5Z29uTGVuZ3RoKGVsKSB7XG4gIHZhciBwb2ludHMgPSBlbC5wb2ludHM7XG4gIHJldHVybiBnZXRQb2x5bGluZUxlbmd0aChlbCkgKyBnZXREaXN0YW5jZShwb2ludHMuZ2V0SXRlbShwb2ludHMubnVtYmVyT2ZJdGVtcyAtIDEpLCBwb2ludHMuZ2V0SXRlbSgwKSk7XG59XG5cbi8vIFBhdGggYW5pbWF0aW9uXG5cbmZ1bmN0aW9uIGdldFRvdGFsTGVuZ3RoKGVsKSB7XG4gIGlmIChlbC5nZXRUb3RhbExlbmd0aCkgeyByZXR1cm4gZWwuZ2V0VG90YWxMZW5ndGgoKTsgfVxuICBzd2l0Y2goZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnY2lyY2xlJzogcmV0dXJuIGdldENpcmNsZUxlbmd0aChlbCk7XG4gICAgY2FzZSAncmVjdCc6IHJldHVybiBnZXRSZWN0TGVuZ3RoKGVsKTtcbiAgICBjYXNlICdsaW5lJzogcmV0dXJuIGdldExpbmVMZW5ndGgoZWwpO1xuICAgIGNhc2UgJ3BvbHlsaW5lJzogcmV0dXJuIGdldFBvbHlsaW5lTGVuZ3RoKGVsKTtcbiAgICBjYXNlICdwb2x5Z29uJzogcmV0dXJuIGdldFBvbHlnb25MZW5ndGgoZWwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNldERhc2hvZmZzZXQoZWwpIHtcbiAgdmFyIHBhdGhMZW5ndGggPSBnZXRUb3RhbExlbmd0aChlbCk7XG4gIGVsLnNldEF0dHJpYnV0ZSgnc3Ryb2tlLWRhc2hhcnJheScsIHBhdGhMZW5ndGgpO1xuICByZXR1cm4gcGF0aExlbmd0aDtcbn1cblxuLy8gTW90aW9uIHBhdGhcblxuZnVuY3Rpb24gZ2V0UGFyZW50U3ZnRWwoZWwpIHtcbiAgdmFyIHBhcmVudEVsID0gZWwucGFyZW50Tm9kZTtcbiAgd2hpbGUgKGlzLnN2ZyhwYXJlbnRFbCkpIHtcbiAgICBpZiAoIWlzLnN2ZyhwYXJlbnRFbC5wYXJlbnROb2RlKSkgeyBicmVhazsgfVxuICAgIHBhcmVudEVsID0gcGFyZW50RWwucGFyZW50Tm9kZTtcbiAgfVxuICByZXR1cm4gcGFyZW50RWw7XG59XG5cbmZ1bmN0aW9uIGdldFBhcmVudFN2ZyhwYXRoRWwsIHN2Z0RhdGEpIHtcbiAgdmFyIHN2ZyA9IHN2Z0RhdGEgfHwge307XG4gIHZhciBwYXJlbnRTdmdFbCA9IHN2Zy5lbCB8fCBnZXRQYXJlbnRTdmdFbChwYXRoRWwpO1xuICB2YXIgcmVjdCA9IHBhcmVudFN2Z0VsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICB2YXIgdmlld0JveEF0dHIgPSBnZXRBdHRyaWJ1dGUocGFyZW50U3ZnRWwsICd2aWV3Qm94Jyk7XG4gIHZhciB3aWR0aCA9IHJlY3Qud2lkdGg7XG4gIHZhciBoZWlnaHQgPSByZWN0LmhlaWdodDtcbiAgdmFyIHZpZXdCb3ggPSBzdmcudmlld0JveCB8fCAodmlld0JveEF0dHIgPyB2aWV3Qm94QXR0ci5zcGxpdCgnICcpIDogWzAsIDAsIHdpZHRoLCBoZWlnaHRdKTtcbiAgcmV0dXJuIHtcbiAgICBlbDogcGFyZW50U3ZnRWwsXG4gICAgdmlld0JveDogdmlld0JveCxcbiAgICB4OiB2aWV3Qm94WzBdIC8gMSxcbiAgICB5OiB2aWV3Qm94WzFdIC8gMSxcbiAgICB3OiB3aWR0aCAvIHZpZXdCb3hbMl0sXG4gICAgaDogaGVpZ2h0IC8gdmlld0JveFszXVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBhdGgocGF0aCwgcGVyY2VudCkge1xuICB2YXIgcGF0aEVsID0gaXMuc3RyKHBhdGgpID8gc2VsZWN0U3RyaW5nKHBhdGgpWzBdIDogcGF0aDtcbiAgdmFyIHAgPSBwZXJjZW50IHx8IDEwMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eSxcbiAgICAgIGVsOiBwYXRoRWwsXG4gICAgICBzdmc6IGdldFBhcmVudFN2ZyhwYXRoRWwpLFxuICAgICAgdG90YWxMZW5ndGg6IGdldFRvdGFsTGVuZ3RoKHBhdGhFbCkgKiAocCAvIDEwMClcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGF0aFByb2dyZXNzKHBhdGgsIHByb2dyZXNzKSB7XG4gIGZ1bmN0aW9uIHBvaW50KG9mZnNldCkge1xuICAgIGlmICggb2Zmc2V0ID09PSB2b2lkIDAgKSBvZmZzZXQgPSAwO1xuXG4gICAgdmFyIGwgPSBwcm9ncmVzcyArIG9mZnNldCA+PSAxID8gcHJvZ3Jlc3MgKyBvZmZzZXQgOiAwO1xuICAgIHJldHVybiBwYXRoLmVsLmdldFBvaW50QXRMZW5ndGgobCk7XG4gIH1cbiAgdmFyIHN2ZyA9IGdldFBhcmVudFN2ZyhwYXRoLmVsLCBwYXRoLnN2Zyk7XG4gIHZhciBwID0gcG9pbnQoKTtcbiAgdmFyIHAwID0gcG9pbnQoLTEpO1xuICB2YXIgcDEgPSBwb2ludCgrMSk7XG4gIHN3aXRjaCAocGF0aC5wcm9wZXJ0eSkge1xuICAgIGNhc2UgJ3gnOiByZXR1cm4gKHAueCAtIHN2Zy54KSAqIHN2Zy53O1xuICAgIGNhc2UgJ3knOiByZXR1cm4gKHAueSAtIHN2Zy55KSAqIHN2Zy5oO1xuICAgIGNhc2UgJ2FuZ2xlJzogcmV0dXJuIE1hdGguYXRhbjIocDEueSAtIHAwLnksIHAxLnggLSBwMC54KSAqIDE4MCAvIE1hdGguUEk7XG4gIH1cbn1cblxuLy8gRGVjb21wb3NlIHZhbHVlXG5cbmZ1bmN0aW9uIGRlY29tcG9zZVZhbHVlKHZhbCwgdW5pdCkge1xuICAvLyBjb25zdCByZ3ggPSAvLT9cXGQqXFwuP1xcZCsvZzsgLy8gaGFuZGxlcyBiYXNpYyBudW1iZXJzXG4gIC8vIGNvbnN0IHJneCA9IC9bKy1dP1xcZCsoPzpcXC5cXGQrKT8oPzpbZUVdWystXT9cXGQrKT8vZzsgLy8gaGFuZGxlcyBleHBvbmVudHMgbm90YXRpb25cbiAgdmFyIHJneCA9IC9bKy1dP1xcZCpcXC4/XFxkKyg/OlxcLlxcZCspPyg/OltlRV1bKy1dP1xcZCspPy9nOyAvLyBoYW5kbGVzIGV4cG9uZW50cyBub3RhdGlvblxuICB2YXIgdmFsdWUgPSB2YWxpZGF0ZVZhbHVlKChpcy5wdGgodmFsKSA/IHZhbC50b3RhbExlbmd0aCA6IHZhbCksIHVuaXQpICsgJyc7XG4gIHJldHVybiB7XG4gICAgb3JpZ2luYWw6IHZhbHVlLFxuICAgIG51bWJlcnM6IHZhbHVlLm1hdGNoKHJneCkgPyB2YWx1ZS5tYXRjaChyZ3gpLm1hcChOdW1iZXIpIDogWzBdLFxuICAgIHN0cmluZ3M6IChpcy5zdHIodmFsKSB8fCB1bml0KSA/IHZhbHVlLnNwbGl0KHJneCkgOiBbXVxuICB9XG59XG5cbi8vIEFuaW1hdGFibGVzXG5cbmZ1bmN0aW9uIHBhcnNlVGFyZ2V0cyh0YXJnZXRzKSB7XG4gIHZhciB0YXJnZXRzQXJyYXkgPSB0YXJnZXRzID8gKGZsYXR0ZW5BcnJheShpcy5hcnIodGFyZ2V0cykgPyB0YXJnZXRzLm1hcCh0b0FycmF5KSA6IHRvQXJyYXkodGFyZ2V0cykpKSA6IFtdO1xuICByZXR1cm4gZmlsdGVyQXJyYXkodGFyZ2V0c0FycmF5LCBmdW5jdGlvbiAoaXRlbSwgcG9zLCBzZWxmKSB7IHJldHVybiBzZWxmLmluZGV4T2YoaXRlbSkgPT09IHBvczsgfSk7XG59XG5cbmZ1bmN0aW9uIGdldEFuaW1hdGFibGVzKHRhcmdldHMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlVGFyZ2V0cyh0YXJnZXRzKTtcbiAgcmV0dXJuIHBhcnNlZC5tYXAoZnVuY3Rpb24gKHQsIGkpIHtcbiAgICByZXR1cm4ge3RhcmdldDogdCwgaWQ6IGksIHRvdGFsOiBwYXJzZWQubGVuZ3RoLCB0cmFuc2Zvcm1zOiB7IGxpc3Q6IGdldEVsZW1lbnRUcmFuc2Zvcm1zKHQpIH0gfTtcbiAgfSk7XG59XG5cbi8vIFByb3BlcnRpZXNcblxuZnVuY3Rpb24gbm9ybWFsaXplUHJvcGVydHlUd2VlbnMocHJvcCwgdHdlZW5TZXR0aW5ncykge1xuICB2YXIgc2V0dGluZ3MgPSBjbG9uZU9iamVjdCh0d2VlblNldHRpbmdzKTtcbiAgLy8gT3ZlcnJpZGUgZHVyYXRpb24gaWYgZWFzaW5nIGlzIGEgc3ByaW5nXG4gIGlmICgvXnNwcmluZy8udGVzdChzZXR0aW5ncy5lYXNpbmcpKSB7IHNldHRpbmdzLmR1cmF0aW9uID0gc3ByaW5nKHNldHRpbmdzLmVhc2luZyk7IH1cbiAgaWYgKGlzLmFycihwcm9wKSkge1xuICAgIHZhciBsID0gcHJvcC5sZW5ndGg7XG4gICAgdmFyIGlzRnJvbVRvID0gKGwgPT09IDIgJiYgIWlzLm9iaihwcm9wWzBdKSk7XG4gICAgaWYgKCFpc0Zyb21Ubykge1xuICAgICAgLy8gRHVyYXRpb24gZGl2aWRlZCBieSB0aGUgbnVtYmVyIG9mIHR3ZWVuc1xuICAgICAgaWYgKCFpcy5mbmModHdlZW5TZXR0aW5ncy5kdXJhdGlvbikpIHsgc2V0dGluZ3MuZHVyYXRpb24gPSB0d2VlblNldHRpbmdzLmR1cmF0aW9uIC8gbDsgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUcmFuc2Zvcm0gW2Zyb20sIHRvXSB2YWx1ZXMgc2hvcnRoYW5kIHRvIGEgdmFsaWQgdHdlZW4gdmFsdWVcbiAgICAgIHByb3AgPSB7dmFsdWU6IHByb3B9O1xuICAgIH1cbiAgfVxuICB2YXIgcHJvcEFycmF5ID0gaXMuYXJyKHByb3ApID8gcHJvcCA6IFtwcm9wXTtcbiAgcmV0dXJuIHByb3BBcnJheS5tYXAoZnVuY3Rpb24gKHYsIGkpIHtcbiAgICB2YXIgb2JqID0gKGlzLm9iaih2KSAmJiAhaXMucHRoKHYpKSA/IHYgOiB7dmFsdWU6IHZ9O1xuICAgIC8vIERlZmF1bHQgZGVsYXkgdmFsdWUgc2hvdWxkIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgZmlyc3QgdHdlZW5cbiAgICBpZiAoaXMudW5kKG9iai5kZWxheSkpIHsgb2JqLmRlbGF5ID0gIWkgPyB0d2VlblNldHRpbmdzLmRlbGF5IDogMDsgfVxuICAgIC8vIERlZmF1bHQgZW5kRGVsYXkgdmFsdWUgc2hvdWxkIG9ubHkgYmUgYXBwbGllZCB0byB0aGUgbGFzdCB0d2VlblxuICAgIGlmIChpcy51bmQob2JqLmVuZERlbGF5KSkgeyBvYmouZW5kRGVsYXkgPSBpID09PSBwcm9wQXJyYXkubGVuZ3RoIC0gMSA/IHR3ZWVuU2V0dGluZ3MuZW5kRGVsYXkgOiAwOyB9XG4gICAgcmV0dXJuIG9iajtcbiAgfSkubWFwKGZ1bmN0aW9uIChrKSB7IHJldHVybiBtZXJnZU9iamVjdHMoaywgc2V0dGluZ3MpOyB9KTtcbn1cblxuXG5mdW5jdGlvbiBmbGF0dGVuS2V5ZnJhbWVzKGtleWZyYW1lcykge1xuICB2YXIgcHJvcGVydHlOYW1lcyA9IGZpbHRlckFycmF5KGZsYXR0ZW5BcnJheShrZXlmcmFtZXMubWFwKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIE9iamVjdC5rZXlzKGtleSk7IH0pKSwgZnVuY3Rpb24gKHApIHsgcmV0dXJuIGlzLmtleShwKTsgfSlcbiAgLnJlZHVjZShmdW5jdGlvbiAoYSxiKSB7IGlmIChhLmluZGV4T2YoYikgPCAwKSB7IGEucHVzaChiKTsgfSByZXR1cm4gYTsgfSwgW10pO1xuICB2YXIgcHJvcGVydGllcyA9IHt9O1xuICB2YXIgbG9vcCA9IGZ1bmN0aW9uICggaSApIHtcbiAgICB2YXIgcHJvcE5hbWUgPSBwcm9wZXJ0eU5hbWVzW2ldO1xuICAgIHByb3BlcnRpZXNbcHJvcE5hbWVdID0ga2V5ZnJhbWVzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICB2YXIgbmV3S2V5ID0ge307XG4gICAgICBmb3IgKHZhciBwIGluIGtleSkge1xuICAgICAgICBpZiAoaXMua2V5KHApKSB7XG4gICAgICAgICAgaWYgKHAgPT0gcHJvcE5hbWUpIHsgbmV3S2V5LnZhbHVlID0ga2V5W3BdOyB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV3S2V5W3BdID0ga2V5W3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3S2V5O1xuICAgIH0pO1xuICB9O1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcGVydHlOYW1lcy5sZW5ndGg7IGkrKykgbG9vcCggaSApO1xuICByZXR1cm4gcHJvcGVydGllcztcbn1cblxuZnVuY3Rpb24gZ2V0UHJvcGVydGllcyh0d2VlblNldHRpbmdzLCBwYXJhbXMpIHtcbiAgdmFyIHByb3BlcnRpZXMgPSBbXTtcbiAgdmFyIGtleWZyYW1lcyA9IHBhcmFtcy5rZXlmcmFtZXM7XG4gIGlmIChrZXlmcmFtZXMpIHsgcGFyYW1zID0gbWVyZ2VPYmplY3RzKGZsYXR0ZW5LZXlmcmFtZXMoa2V5ZnJhbWVzKSwgcGFyYW1zKTsgfVxuICBmb3IgKHZhciBwIGluIHBhcmFtcykge1xuICAgIGlmIChpcy5rZXkocCkpIHtcbiAgICAgIHByb3BlcnRpZXMucHVzaCh7XG4gICAgICAgIG5hbWU6IHAsXG4gICAgICAgIHR3ZWVuczogbm9ybWFsaXplUHJvcGVydHlUd2VlbnMocGFyYW1zW3BdLCB0d2VlblNldHRpbmdzKVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwcm9wZXJ0aWVzO1xufVxuXG4vLyBUd2VlbnNcblxuZnVuY3Rpb24gbm9ybWFsaXplVHdlZW5WYWx1ZXModHdlZW4sIGFuaW1hdGFibGUpIHtcbiAgdmFyIHQgPSB7fTtcbiAgZm9yICh2YXIgcCBpbiB0d2Vlbikge1xuICAgIHZhciB2YWx1ZSA9IGdldEZ1bmN0aW9uVmFsdWUodHdlZW5bcF0sIGFuaW1hdGFibGUpO1xuICAgIGlmIChpcy5hcnIodmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodikgeyByZXR1cm4gZ2V0RnVuY3Rpb25WYWx1ZSh2LCBhbmltYXRhYmxlKTsgfSk7XG4gICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAxKSB7IHZhbHVlID0gdmFsdWVbMF07IH1cbiAgICB9XG4gICAgdFtwXSA9IHZhbHVlO1xuICB9XG4gIHQuZHVyYXRpb24gPSBwYXJzZUZsb2F0KHQuZHVyYXRpb24pO1xuICB0LmRlbGF5ID0gcGFyc2VGbG9hdCh0LmRlbGF5KTtcbiAgcmV0dXJuIHQ7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVR3ZWVucyhwcm9wLCBhbmltYXRhYmxlKSB7XG4gIHZhciBwcmV2aW91c1R3ZWVuO1xuICByZXR1cm4gcHJvcC50d2VlbnMubWFwKGZ1bmN0aW9uICh0KSB7XG4gICAgdmFyIHR3ZWVuID0gbm9ybWFsaXplVHdlZW5WYWx1ZXModCwgYW5pbWF0YWJsZSk7XG4gICAgdmFyIHR3ZWVuVmFsdWUgPSB0d2Vlbi52YWx1ZTtcbiAgICB2YXIgdG8gPSBpcy5hcnIodHdlZW5WYWx1ZSkgPyB0d2VlblZhbHVlWzFdIDogdHdlZW5WYWx1ZTtcbiAgICB2YXIgdG9Vbml0ID0gZ2V0VW5pdCh0byk7XG4gICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBnZXRPcmlnaW5hbFRhcmdldFZhbHVlKGFuaW1hdGFibGUudGFyZ2V0LCBwcm9wLm5hbWUsIHRvVW5pdCwgYW5pbWF0YWJsZSk7XG4gICAgdmFyIHByZXZpb3VzVmFsdWUgPSBwcmV2aW91c1R3ZWVuID8gcHJldmlvdXNUd2Vlbi50by5vcmlnaW5hbCA6IG9yaWdpbmFsVmFsdWU7XG4gICAgdmFyIGZyb20gPSBpcy5hcnIodHdlZW5WYWx1ZSkgPyB0d2VlblZhbHVlWzBdIDogcHJldmlvdXNWYWx1ZTtcbiAgICB2YXIgZnJvbVVuaXQgPSBnZXRVbml0KGZyb20pIHx8IGdldFVuaXQob3JpZ2luYWxWYWx1ZSk7XG4gICAgdmFyIHVuaXQgPSB0b1VuaXQgfHwgZnJvbVVuaXQ7XG4gICAgaWYgKGlzLnVuZCh0bykpIHsgdG8gPSBwcmV2aW91c1ZhbHVlOyB9XG4gICAgdHdlZW4uZnJvbSA9IGRlY29tcG9zZVZhbHVlKGZyb20sIHVuaXQpO1xuICAgIHR3ZWVuLnRvID0gZGVjb21wb3NlVmFsdWUoZ2V0UmVsYXRpdmVWYWx1ZSh0bywgZnJvbSksIHVuaXQpO1xuICAgIHR3ZWVuLnN0YXJ0ID0gcHJldmlvdXNUd2VlbiA/IHByZXZpb3VzVHdlZW4uZW5kIDogMDtcbiAgICB0d2Vlbi5lbmQgPSB0d2Vlbi5zdGFydCArIHR3ZWVuLmRlbGF5ICsgdHdlZW4uZHVyYXRpb24gKyB0d2Vlbi5lbmREZWxheTtcbiAgICB0d2Vlbi5lYXNpbmcgPSBwYXJzZUVhc2luZ3ModHdlZW4uZWFzaW5nLCB0d2Vlbi5kdXJhdGlvbik7XG4gICAgdHdlZW4uaXNQYXRoID0gaXMucHRoKHR3ZWVuVmFsdWUpO1xuICAgIHR3ZWVuLmlzQ29sb3IgPSBpcy5jb2wodHdlZW4uZnJvbS5vcmlnaW5hbCk7XG4gICAgaWYgKHR3ZWVuLmlzQ29sb3IpIHsgdHdlZW4ucm91bmQgPSAxOyB9XG4gICAgcHJldmlvdXNUd2VlbiA9IHR3ZWVuO1xuICAgIHJldHVybiB0d2VlbjtcbiAgfSk7XG59XG5cbi8vIFR3ZWVuIHByb2dyZXNzXG5cbnZhciBzZXRQcm9ncmVzc1ZhbHVlID0ge1xuICBjc3M6IGZ1bmN0aW9uICh0LCBwLCB2KSB7IHJldHVybiB0LnN0eWxlW3BdID0gdjsgfSxcbiAgYXR0cmlidXRlOiBmdW5jdGlvbiAodCwgcCwgdikgeyByZXR1cm4gdC5zZXRBdHRyaWJ1dGUocCwgdik7IH0sXG4gIG9iamVjdDogZnVuY3Rpb24gKHQsIHAsIHYpIHsgcmV0dXJuIHRbcF0gPSB2OyB9LFxuICB0cmFuc2Zvcm06IGZ1bmN0aW9uICh0LCBwLCB2LCB0cmFuc2Zvcm1zLCBtYW51YWwpIHtcbiAgICB0cmFuc2Zvcm1zLmxpc3Quc2V0KHAsIHYpO1xuICAgIGlmIChwID09PSB0cmFuc2Zvcm1zLmxhc3QgfHwgbWFudWFsKSB7XG4gICAgICB2YXIgc3RyID0gJyc7XG4gICAgICB0cmFuc2Zvcm1zLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIHByb3ApIHsgc3RyICs9IHByb3AgKyBcIihcIiArIHZhbHVlICsgXCIpIFwiOyB9KTtcbiAgICAgIHQuc3R5bGUudHJhbnNmb3JtID0gc3RyO1xuICAgIH1cbiAgfVxufTtcblxuLy8gU2V0IFZhbHVlIGhlbHBlclxuXG5mdW5jdGlvbiBzZXRUYXJnZXRzVmFsdWUodGFyZ2V0cywgcHJvcGVydGllcykge1xuICB2YXIgYW5pbWF0YWJsZXMgPSBnZXRBbmltYXRhYmxlcyh0YXJnZXRzKTtcbiAgYW5pbWF0YWJsZXMuZm9yRWFjaChmdW5jdGlvbiAoYW5pbWF0YWJsZSkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHByb3BlcnRpZXMpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGdldEZ1bmN0aW9uVmFsdWUocHJvcGVydGllc1twcm9wZXJ0eV0sIGFuaW1hdGFibGUpO1xuICAgICAgdmFyIHRhcmdldCA9IGFuaW1hdGFibGUudGFyZ2V0O1xuICAgICAgdmFyIHZhbHVlVW5pdCA9IGdldFVuaXQodmFsdWUpO1xuICAgICAgdmFyIG9yaWdpbmFsVmFsdWUgPSBnZXRPcmlnaW5hbFRhcmdldFZhbHVlKHRhcmdldCwgcHJvcGVydHksIHZhbHVlVW5pdCwgYW5pbWF0YWJsZSk7XG4gICAgICB2YXIgdW5pdCA9IHZhbHVlVW5pdCB8fCBnZXRVbml0KG9yaWdpbmFsVmFsdWUpO1xuICAgICAgdmFyIHRvID0gZ2V0UmVsYXRpdmVWYWx1ZSh2YWxpZGF0ZVZhbHVlKHZhbHVlLCB1bml0KSwgb3JpZ2luYWxWYWx1ZSk7XG4gICAgICB2YXIgYW5pbVR5cGUgPSBnZXRBbmltYXRpb25UeXBlKHRhcmdldCwgcHJvcGVydHkpO1xuICAgICAgc2V0UHJvZ3Jlc3NWYWx1ZVthbmltVHlwZV0odGFyZ2V0LCBwcm9wZXJ0eSwgdG8sIGFuaW1hdGFibGUudHJhbnNmb3JtcywgdHJ1ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gQW5pbWF0aW9uc1xuXG5mdW5jdGlvbiBjcmVhdGVBbmltYXRpb24oYW5pbWF0YWJsZSwgcHJvcCkge1xuICB2YXIgYW5pbVR5cGUgPSBnZXRBbmltYXRpb25UeXBlKGFuaW1hdGFibGUudGFyZ2V0LCBwcm9wLm5hbWUpO1xuICBpZiAoYW5pbVR5cGUpIHtcbiAgICB2YXIgdHdlZW5zID0gbm9ybWFsaXplVHdlZW5zKHByb3AsIGFuaW1hdGFibGUpO1xuICAgIHZhciBsYXN0VHdlZW4gPSB0d2VlbnNbdHdlZW5zLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiBhbmltVHlwZSxcbiAgICAgIHByb3BlcnR5OiBwcm9wLm5hbWUsXG4gICAgICBhbmltYXRhYmxlOiBhbmltYXRhYmxlLFxuICAgICAgdHdlZW5zOiB0d2VlbnMsXG4gICAgICBkdXJhdGlvbjogbGFzdFR3ZWVuLmVuZCxcbiAgICAgIGRlbGF5OiB0d2VlbnNbMF0uZGVsYXksXG4gICAgICBlbmREZWxheTogbGFzdFR3ZWVuLmVuZERlbGF5XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldEFuaW1hdGlvbnMoYW5pbWF0YWJsZXMsIHByb3BlcnRpZXMpIHtcbiAgcmV0dXJuIGZpbHRlckFycmF5KGZsYXR0ZW5BcnJheShhbmltYXRhYmxlcy5tYXAoZnVuY3Rpb24gKGFuaW1hdGFibGUpIHtcbiAgICByZXR1cm4gcHJvcGVydGllcy5tYXAoZnVuY3Rpb24gKHByb3ApIHtcbiAgICAgIHJldHVybiBjcmVhdGVBbmltYXRpb24oYW5pbWF0YWJsZSwgcHJvcCk7XG4gICAgfSk7XG4gIH0pKSwgZnVuY3Rpb24gKGEpIHsgcmV0dXJuICFpcy51bmQoYSk7IH0pO1xufVxuXG4vLyBDcmVhdGUgSW5zdGFuY2VcblxuZnVuY3Rpb24gZ2V0SW5zdGFuY2VUaW1pbmdzKGFuaW1hdGlvbnMsIHR3ZWVuU2V0dGluZ3MpIHtcbiAgdmFyIGFuaW1MZW5ndGggPSBhbmltYXRpb25zLmxlbmd0aDtcbiAgdmFyIGdldFRsT2Zmc2V0ID0gZnVuY3Rpb24gKGFuaW0pIHsgcmV0dXJuIGFuaW0udGltZWxpbmVPZmZzZXQgPyBhbmltLnRpbWVsaW5lT2Zmc2V0IDogMDsgfTtcbiAgdmFyIHRpbWluZ3MgPSB7fTtcbiAgdGltaW5ncy5kdXJhdGlvbiA9IGFuaW1MZW5ndGggPyBNYXRoLm1heC5hcHBseShNYXRoLCBhbmltYXRpb25zLm1hcChmdW5jdGlvbiAoYW5pbSkgeyByZXR1cm4gZ2V0VGxPZmZzZXQoYW5pbSkgKyBhbmltLmR1cmF0aW9uOyB9KSkgOiB0d2VlblNldHRpbmdzLmR1cmF0aW9uO1xuICB0aW1pbmdzLmRlbGF5ID0gYW5pbUxlbmd0aCA/IE1hdGgubWluLmFwcGx5KE1hdGgsIGFuaW1hdGlvbnMubWFwKGZ1bmN0aW9uIChhbmltKSB7IHJldHVybiBnZXRUbE9mZnNldChhbmltKSArIGFuaW0uZGVsYXk7IH0pKSA6IHR3ZWVuU2V0dGluZ3MuZGVsYXk7XG4gIHRpbWluZ3MuZW5kRGVsYXkgPSBhbmltTGVuZ3RoID8gdGltaW5ncy5kdXJhdGlvbiAtIE1hdGgubWF4LmFwcGx5KE1hdGgsIGFuaW1hdGlvbnMubWFwKGZ1bmN0aW9uIChhbmltKSB7IHJldHVybiBnZXRUbE9mZnNldChhbmltKSArIGFuaW0uZHVyYXRpb24gLSBhbmltLmVuZERlbGF5OyB9KSkgOiB0d2VlblNldHRpbmdzLmVuZERlbGF5O1xuICByZXR1cm4gdGltaW5ncztcbn1cblxudmFyIGluc3RhbmNlSUQgPSAwO1xuXG5mdW5jdGlvbiBjcmVhdGVOZXdJbnN0YW5jZShwYXJhbXMpIHtcbiAgdmFyIGluc3RhbmNlU2V0dGluZ3MgPSByZXBsYWNlT2JqZWN0UHJvcHMoZGVmYXVsdEluc3RhbmNlU2V0dGluZ3MsIHBhcmFtcyk7XG4gIHZhciB0d2VlblNldHRpbmdzID0gcmVwbGFjZU9iamVjdFByb3BzKGRlZmF1bHRUd2VlblNldHRpbmdzLCBwYXJhbXMpO1xuICB2YXIgcHJvcGVydGllcyA9IGdldFByb3BlcnRpZXModHdlZW5TZXR0aW5ncywgcGFyYW1zKTtcbiAgdmFyIGFuaW1hdGFibGVzID0gZ2V0QW5pbWF0YWJsZXMocGFyYW1zLnRhcmdldHMpO1xuICB2YXIgYW5pbWF0aW9ucyA9IGdldEFuaW1hdGlvbnMoYW5pbWF0YWJsZXMsIHByb3BlcnRpZXMpO1xuICB2YXIgdGltaW5ncyA9IGdldEluc3RhbmNlVGltaW5ncyhhbmltYXRpb25zLCB0d2VlblNldHRpbmdzKTtcbiAgdmFyIGlkID0gaW5zdGFuY2VJRDtcbiAgaW5zdGFuY2VJRCsrO1xuICByZXR1cm4gbWVyZ2VPYmplY3RzKGluc3RhbmNlU2V0dGluZ3MsIHtcbiAgICBpZDogaWQsXG4gICAgY2hpbGRyZW46IFtdLFxuICAgIGFuaW1hdGFibGVzOiBhbmltYXRhYmxlcyxcbiAgICBhbmltYXRpb25zOiBhbmltYXRpb25zLFxuICAgIGR1cmF0aW9uOiB0aW1pbmdzLmR1cmF0aW9uLFxuICAgIGRlbGF5OiB0aW1pbmdzLmRlbGF5LFxuICAgIGVuZERlbGF5OiB0aW1pbmdzLmVuZERlbGF5XG4gIH0pO1xufVxuXG4vLyBDb3JlXG5cbnZhciBhY3RpdmVJbnN0YW5jZXMgPSBbXTtcbnZhciBwYXVzZWRJbnN0YW5jZXMgPSBbXTtcbnZhciByYWY7XG5cbnZhciBlbmdpbmUgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBwbGF5KCkgeyBcbiAgICByYWYgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XG4gIH1cbiAgZnVuY3Rpb24gc3RlcCh0KSB7XG4gICAgdmFyIGFjdGl2ZUluc3RhbmNlc0xlbmd0aCA9IGFjdGl2ZUluc3RhbmNlcy5sZW5ndGg7XG4gICAgaWYgKGFjdGl2ZUluc3RhbmNlc0xlbmd0aCkge1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgd2hpbGUgKGkgPCBhY3RpdmVJbnN0YW5jZXNMZW5ndGgpIHtcbiAgICAgICAgdmFyIGFjdGl2ZUluc3RhbmNlID0gYWN0aXZlSW5zdGFuY2VzW2ldO1xuICAgICAgICBpZiAoIWFjdGl2ZUluc3RhbmNlLnBhdXNlZCkge1xuICAgICAgICAgIGFjdGl2ZUluc3RhbmNlLnRpY2sodCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGluc3RhbmNlSW5kZXggPSBhY3RpdmVJbnN0YW5jZXMuaW5kZXhPZihhY3RpdmVJbnN0YW5jZSk7XG4gICAgICAgICAgaWYgKGluc3RhbmNlSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgYWN0aXZlSW5zdGFuY2VzLnNwbGljZShpbnN0YW5jZUluZGV4LCAxKTtcbiAgICAgICAgICAgIGFjdGl2ZUluc3RhbmNlc0xlbmd0aCA9IGFjdGl2ZUluc3RhbmNlcy5sZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICAgIH1cbiAgICAgIHBsYXkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmFmID0gY2FuY2VsQW5pbWF0aW9uRnJhbWUocmFmKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBsYXk7XG59KSgpO1xuXG5mdW5jdGlvbiBoYW5kbGVWaXNpYmlsaXR5Q2hhbmdlKCkge1xuICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgYWN0aXZlSW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24gKGlucykgeyByZXR1cm4gaW5zLnBhdXNlKCk7IH0pO1xuICAgIHBhdXNlZEluc3RhbmNlcyA9IGFjdGl2ZUluc3RhbmNlcy5zbGljZSgwKTtcbiAgICBhbmltZS5ydW5uaW5nID0gYWN0aXZlSW5zdGFuY2VzID0gW107XG4gIH0gZWxzZSB7XG4gICAgcGF1c2VkSW5zdGFuY2VzLmZvckVhY2goZnVuY3Rpb24gKGlucykgeyByZXR1cm4gaW5zLnBsYXkoKTsgfSk7XG4gIH1cbn1cblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndmlzaWJpbGl0eWNoYW5nZScsIGhhbmRsZVZpc2liaWxpdHlDaGFuZ2UpO1xufVxuXG4vLyBQdWJsaWMgSW5zdGFuY2VcblxuZnVuY3Rpb24gYW5pbWUocGFyYW1zKSB7XG4gIGlmICggcGFyYW1zID09PSB2b2lkIDAgKSBwYXJhbXMgPSB7fTtcblxuXG4gIHZhciBzdGFydFRpbWUgPSAwLCBsYXN0VGltZSA9IDAsIG5vdyA9IDA7XG4gIHZhciBjaGlsZHJlbiwgY2hpbGRyZW5MZW5ndGggPSAwO1xuICB2YXIgcmVzb2x2ZSA9IG51bGw7XG5cbiAgZnVuY3Rpb24gbWFrZVByb21pc2UoaW5zdGFuY2UpIHtcbiAgICB2YXIgcHJvbWlzZSA9IHdpbmRvdy5Qcm9taXNlICYmIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChfcmVzb2x2ZSkgeyByZXR1cm4gcmVzb2x2ZSA9IF9yZXNvbHZlOyB9KTtcbiAgICBpbnN0YW5jZS5maW5pc2hlZCA9IHByb21pc2U7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICB2YXIgaW5zdGFuY2UgPSBjcmVhdGVOZXdJbnN0YW5jZShwYXJhbXMpO1xuICB2YXIgcHJvbWlzZSA9IG1ha2VQcm9taXNlKGluc3RhbmNlKTtcblxuICBmdW5jdGlvbiB0b2dnbGVJbnN0YW5jZURpcmVjdGlvbigpIHtcbiAgICB2YXIgZGlyZWN0aW9uID0gaW5zdGFuY2UuZGlyZWN0aW9uO1xuICAgIGlmIChkaXJlY3Rpb24gIT09ICdhbHRlcm5hdGUnKSB7XG4gICAgICBpbnN0YW5jZS5kaXJlY3Rpb24gPSBkaXJlY3Rpb24gIT09ICdub3JtYWwnID8gJ25vcm1hbCcgOiAncmV2ZXJzZSc7XG4gICAgfVxuICAgIGluc3RhbmNlLnJldmVyc2VkID0gIWluc3RhbmNlLnJldmVyc2VkO1xuICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7IHJldHVybiBjaGlsZC5yZXZlcnNlZCA9IGluc3RhbmNlLnJldmVyc2VkOyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkanVzdFRpbWUodGltZSkge1xuICAgIHJldHVybiBpbnN0YW5jZS5yZXZlcnNlZCA/IGluc3RhbmNlLmR1cmF0aW9uIC0gdGltZSA6IHRpbWU7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRpbWUoKSB7XG4gICAgc3RhcnRUaW1lID0gMDtcbiAgICBsYXN0VGltZSA9IGFkanVzdFRpbWUoaW5zdGFuY2UuY3VycmVudFRpbWUpICogKDEgLyBhbmltZS5zcGVlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBzZWVrQ2hpbGQodGltZSwgY2hpbGQpIHtcbiAgICBpZiAoY2hpbGQpIHsgY2hpbGQuc2Vlayh0aW1lIC0gY2hpbGQudGltZWxpbmVPZmZzZXQpOyB9XG4gIH1cblxuICBmdW5jdGlvbiBzeW5jSW5zdGFuY2VDaGlsZHJlbih0aW1lKSB7XG4gICAgaWYgKCFpbnN0YW5jZS5yZXZlcnNlUGxheWJhY2spIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW5MZW5ndGg7IGkrKykgeyBzZWVrQ2hpbGQodGltZSwgY2hpbGRyZW5baV0pOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkkMSA9IGNoaWxkcmVuTGVuZ3RoOyBpJDEtLTspIHsgc2Vla0NoaWxkKHRpbWUsIGNoaWxkcmVuW2kkMV0pOyB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0QW5pbWF0aW9uc1Byb2dyZXNzKGluc1RpbWUpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGFuaW1hdGlvbnMgPSBpbnN0YW5jZS5hbmltYXRpb25zO1xuICAgIHZhciBhbmltYXRpb25zTGVuZ3RoID0gYW5pbWF0aW9ucy5sZW5ndGg7XG4gICAgd2hpbGUgKGkgPCBhbmltYXRpb25zTGVuZ3RoKSB7XG4gICAgICB2YXIgYW5pbSA9IGFuaW1hdGlvbnNbaV07XG4gICAgICB2YXIgYW5pbWF0YWJsZSA9IGFuaW0uYW5pbWF0YWJsZTtcbiAgICAgIHZhciB0d2VlbnMgPSBhbmltLnR3ZWVucztcbiAgICAgIHZhciB0d2Vlbkxlbmd0aCA9IHR3ZWVucy5sZW5ndGggLSAxO1xuICAgICAgdmFyIHR3ZWVuID0gdHdlZW5zW3R3ZWVuTGVuZ3RoXTtcbiAgICAgIC8vIE9ubHkgY2hlY2sgZm9yIGtleWZyYW1lcyBpZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHR3ZWVuXG4gICAgICBpZiAodHdlZW5MZW5ndGgpIHsgdHdlZW4gPSBmaWx0ZXJBcnJheSh0d2VlbnMsIGZ1bmN0aW9uICh0KSB7IHJldHVybiAoaW5zVGltZSA8IHQuZW5kKTsgfSlbMF0gfHwgdHdlZW47IH1cbiAgICAgIHZhciBlbGFwc2VkID0gbWluTWF4KGluc1RpbWUgLSB0d2Vlbi5zdGFydCAtIHR3ZWVuLmRlbGF5LCAwLCB0d2Vlbi5kdXJhdGlvbikgLyB0d2Vlbi5kdXJhdGlvbjtcbiAgICAgIHZhciBlYXNlZCA9IGlzTmFOKGVsYXBzZWQpID8gMSA6IHR3ZWVuLmVhc2luZyhlbGFwc2VkKTtcbiAgICAgIHZhciBzdHJpbmdzID0gdHdlZW4udG8uc3RyaW5ncztcbiAgICAgIHZhciByb3VuZCA9IHR3ZWVuLnJvdW5kO1xuICAgICAgdmFyIG51bWJlcnMgPSBbXTtcbiAgICAgIHZhciB0b051bWJlcnNMZW5ndGggPSB0d2Vlbi50by5udW1iZXJzLmxlbmd0aDtcbiAgICAgIHZhciBwcm9ncmVzcyA9ICh2b2lkIDApO1xuICAgICAgZm9yICh2YXIgbiA9IDA7IG4gPCB0b051bWJlcnNMZW5ndGg7IG4rKykge1xuICAgICAgICB2YXIgdmFsdWUgPSAodm9pZCAwKTtcbiAgICAgICAgdmFyIHRvTnVtYmVyID0gdHdlZW4udG8ubnVtYmVyc1tuXTtcbiAgICAgICAgdmFyIGZyb21OdW1iZXIgPSB0d2Vlbi5mcm9tLm51bWJlcnNbbl0gfHwgMDtcbiAgICAgICAgaWYgKCF0d2Vlbi5pc1BhdGgpIHtcbiAgICAgICAgICB2YWx1ZSA9IGZyb21OdW1iZXIgKyAoZWFzZWQgKiAodG9OdW1iZXIgLSBmcm9tTnVtYmVyKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBnZXRQYXRoUHJvZ3Jlc3ModHdlZW4udmFsdWUsIGVhc2VkICogdG9OdW1iZXIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyb3VuZCkge1xuICAgICAgICAgIGlmICghKHR3ZWVuLmlzQ29sb3IgJiYgbiA+IDIpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IE1hdGgucm91bmQodmFsdWUgKiByb3VuZCkgLyByb3VuZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbnVtYmVycy5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIC8vIE1hbnVhbCBBcnJheS5yZWR1Y2UgZm9yIGJldHRlciBwZXJmb3JtYW5jZXNcbiAgICAgIHZhciBzdHJpbmdzTGVuZ3RoID0gc3RyaW5ncy5sZW5ndGg7XG4gICAgICBpZiAoIXN0cmluZ3NMZW5ndGgpIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSBudW1iZXJzWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvZ3Jlc3MgPSBzdHJpbmdzWzBdO1xuICAgICAgICBmb3IgKHZhciBzID0gMDsgcyA8IHN0cmluZ3NMZW5ndGg7IHMrKykge1xuICAgICAgICAgIHZhciBhID0gc3RyaW5nc1tzXTtcbiAgICAgICAgICB2YXIgYiA9IHN0cmluZ3NbcyArIDFdO1xuICAgICAgICAgIHZhciBuJDEgPSBudW1iZXJzW3NdO1xuICAgICAgICAgIGlmICghaXNOYU4obiQxKSkge1xuICAgICAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICAgIHByb2dyZXNzICs9IG4kMSArICcgJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHByb2dyZXNzICs9IG4kMSArIGI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzZXRQcm9ncmVzc1ZhbHVlW2FuaW0udHlwZV0oYW5pbWF0YWJsZS50YXJnZXQsIGFuaW0ucHJvcGVydHksIHByb2dyZXNzLCBhbmltYXRhYmxlLnRyYW5zZm9ybXMpO1xuICAgICAgYW5pbS5jdXJyZW50VmFsdWUgPSBwcm9ncmVzcztcbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRDYWxsYmFjayhjYikge1xuICAgIGlmIChpbnN0YW5jZVtjYl0gJiYgIWluc3RhbmNlLnBhc3NUaHJvdWdoKSB7IGluc3RhbmNlW2NiXShpbnN0YW5jZSk7IH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNvdW50SXRlcmF0aW9uKCkge1xuICAgIGlmIChpbnN0YW5jZS5yZW1haW5pbmcgJiYgaW5zdGFuY2UucmVtYWluaW5nICE9PSB0cnVlKSB7XG4gICAgICBpbnN0YW5jZS5yZW1haW5pbmctLTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRJbnN0YW5jZVByb2dyZXNzKGVuZ2luZVRpbWUpIHtcbiAgICB2YXIgaW5zRHVyYXRpb24gPSBpbnN0YW5jZS5kdXJhdGlvbjtcbiAgICB2YXIgaW5zRGVsYXkgPSBpbnN0YW5jZS5kZWxheTtcbiAgICB2YXIgaW5zRW5kRGVsYXkgPSBpbnNEdXJhdGlvbiAtIGluc3RhbmNlLmVuZERlbGF5O1xuICAgIHZhciBpbnNUaW1lID0gYWRqdXN0VGltZShlbmdpbmVUaW1lKTtcbiAgICBpbnN0YW5jZS5wcm9ncmVzcyA9IG1pbk1heCgoaW5zVGltZSAvIGluc0R1cmF0aW9uKSAqIDEwMCwgMCwgMTAwKTtcbiAgICBpbnN0YW5jZS5yZXZlcnNlUGxheWJhY2sgPSBpbnNUaW1lIDwgaW5zdGFuY2UuY3VycmVudFRpbWU7XG4gICAgaWYgKGNoaWxkcmVuKSB7IHN5bmNJbnN0YW5jZUNoaWxkcmVuKGluc1RpbWUpOyB9XG4gICAgaWYgKCFpbnN0YW5jZS5iZWdhbiAmJiBpbnN0YW5jZS5jdXJyZW50VGltZSA+IDApIHtcbiAgICAgIGluc3RhbmNlLmJlZ2FuID0gdHJ1ZTtcbiAgICAgIHNldENhbGxiYWNrKCdiZWdpbicpO1xuICAgIH1cbiAgICBpZiAoIWluc3RhbmNlLmxvb3BCZWdhbiAmJiBpbnN0YW5jZS5jdXJyZW50VGltZSA+IDApIHtcbiAgICAgIGluc3RhbmNlLmxvb3BCZWdhbiA9IHRydWU7XG4gICAgICBzZXRDYWxsYmFjaygnbG9vcEJlZ2luJyk7XG4gICAgfVxuICAgIGlmIChpbnNUaW1lIDw9IGluc0RlbGF5ICYmIGluc3RhbmNlLmN1cnJlbnRUaW1lICE9PSAwKSB7XG4gICAgICBzZXRBbmltYXRpb25zUHJvZ3Jlc3MoMCk7XG4gICAgfVxuICAgIGlmICgoaW5zVGltZSA+PSBpbnNFbmREZWxheSAmJiBpbnN0YW5jZS5jdXJyZW50VGltZSAhPT0gaW5zRHVyYXRpb24pIHx8ICFpbnNEdXJhdGlvbikge1xuICAgICAgc2V0QW5pbWF0aW9uc1Byb2dyZXNzKGluc0R1cmF0aW9uKTtcbiAgICB9XG4gICAgaWYgKGluc1RpbWUgPiBpbnNEZWxheSAmJiBpbnNUaW1lIDwgaW5zRW5kRGVsYXkpIHtcbiAgICAgIGlmICghaW5zdGFuY2UuY2hhbmdlQmVnYW4pIHtcbiAgICAgICAgaW5zdGFuY2UuY2hhbmdlQmVnYW4gPSB0cnVlO1xuICAgICAgICBpbnN0YW5jZS5jaGFuZ2VDb21wbGV0ZWQgPSBmYWxzZTtcbiAgICAgICAgc2V0Q2FsbGJhY2soJ2NoYW5nZUJlZ2luJyk7XG4gICAgICB9XG4gICAgICBzZXRDYWxsYmFjaygnY2hhbmdlJyk7XG4gICAgICBzZXRBbmltYXRpb25zUHJvZ3Jlc3MoaW5zVGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpbnN0YW5jZS5jaGFuZ2VCZWdhbikge1xuICAgICAgICBpbnN0YW5jZS5jaGFuZ2VDb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICBpbnN0YW5jZS5jaGFuZ2VCZWdhbiA9IGZhbHNlO1xuICAgICAgICBzZXRDYWxsYmFjaygnY2hhbmdlQ29tcGxldGUnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaW5zdGFuY2UuY3VycmVudFRpbWUgPSBtaW5NYXgoaW5zVGltZSwgMCwgaW5zRHVyYXRpb24pO1xuICAgIGlmIChpbnN0YW5jZS5iZWdhbikgeyBzZXRDYWxsYmFjaygndXBkYXRlJyk7IH1cbiAgICBpZiAoZW5naW5lVGltZSA+PSBpbnNEdXJhdGlvbikge1xuICAgICAgbGFzdFRpbWUgPSAwO1xuICAgICAgY291bnRJdGVyYXRpb24oKTtcbiAgICAgIGlmICghaW5zdGFuY2UucmVtYWluaW5nKSB7XG4gICAgICAgIGluc3RhbmNlLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIGlmICghaW5zdGFuY2UuY29tcGxldGVkKSB7XG4gICAgICAgICAgaW5zdGFuY2UuY29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICBzZXRDYWxsYmFjaygnbG9vcENvbXBsZXRlJyk7XG4gICAgICAgICAgc2V0Q2FsbGJhY2soJ2NvbXBsZXRlJyk7XG4gICAgICAgICAgaWYgKCFpbnN0YW5jZS5wYXNzVGhyb3VnaCAmJiAnUHJvbWlzZScgaW4gd2luZG93KSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICBwcm9taXNlID0gbWFrZVByb21pc2UoaW5zdGFuY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhcnRUaW1lID0gbm93O1xuICAgICAgICBzZXRDYWxsYmFjaygnbG9vcENvbXBsZXRlJyk7XG4gICAgICAgIGluc3RhbmNlLmxvb3BCZWdhbiA9IGZhbHNlO1xuICAgICAgICBpZiAoaW5zdGFuY2UuZGlyZWN0aW9uID09PSAnYWx0ZXJuYXRlJykge1xuICAgICAgICAgIHRvZ2dsZUluc3RhbmNlRGlyZWN0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpbnN0YW5jZS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkaXJlY3Rpb24gPSBpbnN0YW5jZS5kaXJlY3Rpb247XG4gICAgaW5zdGFuY2UucGFzc1Rocm91Z2ggPSBmYWxzZTtcbiAgICBpbnN0YW5jZS5jdXJyZW50VGltZSA9IDA7XG4gICAgaW5zdGFuY2UucHJvZ3Jlc3MgPSAwO1xuICAgIGluc3RhbmNlLnBhdXNlZCA9IHRydWU7XG4gICAgaW5zdGFuY2UuYmVnYW4gPSBmYWxzZTtcbiAgICBpbnN0YW5jZS5sb29wQmVnYW4gPSBmYWxzZTtcbiAgICBpbnN0YW5jZS5jaGFuZ2VCZWdhbiA9IGZhbHNlO1xuICAgIGluc3RhbmNlLmNvbXBsZXRlZCA9IGZhbHNlO1xuICAgIGluc3RhbmNlLmNoYW5nZUNvbXBsZXRlZCA9IGZhbHNlO1xuICAgIGluc3RhbmNlLnJldmVyc2VQbGF5YmFjayA9IGZhbHNlO1xuICAgIGluc3RhbmNlLnJldmVyc2VkID0gZGlyZWN0aW9uID09PSAncmV2ZXJzZSc7XG4gICAgaW5zdGFuY2UucmVtYWluaW5nID0gaW5zdGFuY2UubG9vcDtcbiAgICBjaGlsZHJlbiA9IGluc3RhbmNlLmNoaWxkcmVuO1xuICAgIGNoaWxkcmVuTGVuZ3RoID0gY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSBjaGlsZHJlbkxlbmd0aDsgaS0tOykgeyBpbnN0YW5jZS5jaGlsZHJlbltpXS5yZXNldCgpOyB9XG4gICAgaWYgKGluc3RhbmNlLnJldmVyc2VkICYmIGluc3RhbmNlLmxvb3AgIT09IHRydWUgfHwgKGRpcmVjdGlvbiA9PT0gJ2FsdGVybmF0ZScgJiYgaW5zdGFuY2UubG9vcCA9PT0gMSkpIHsgaW5zdGFuY2UucmVtYWluaW5nKys7IH1cbiAgICBzZXRBbmltYXRpb25zUHJvZ3Jlc3MoaW5zdGFuY2UucmV2ZXJzZWQgPyBpbnN0YW5jZS5kdXJhdGlvbiA6IDApO1xuICB9O1xuXG4gIC8vIFNldCBWYWx1ZSBoZWxwZXJcblxuICBpbnN0YW5jZS5zZXQgPSBmdW5jdGlvbih0YXJnZXRzLCBwcm9wZXJ0aWVzKSB7XG4gICAgc2V0VGFyZ2V0c1ZhbHVlKHRhcmdldHMsIHByb3BlcnRpZXMpO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICBpbnN0YW5jZS50aWNrID0gZnVuY3Rpb24odCkge1xuICAgIG5vdyA9IHQ7XG4gICAgaWYgKCFzdGFydFRpbWUpIHsgc3RhcnRUaW1lID0gbm93OyB9XG4gICAgc2V0SW5zdGFuY2VQcm9ncmVzcygobm93ICsgKGxhc3RUaW1lIC0gc3RhcnRUaW1lKSkgKiBhbmltZS5zcGVlZCk7XG4gIH07XG5cbiAgaW5zdGFuY2Uuc2VlayA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICBzZXRJbnN0YW5jZVByb2dyZXNzKGFkanVzdFRpbWUodGltZSkpO1xuICB9O1xuXG4gIGluc3RhbmNlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgaW5zdGFuY2UucGF1c2VkID0gdHJ1ZTtcbiAgICByZXNldFRpbWUoKTtcbiAgfTtcblxuICBpbnN0YW5jZS5wbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFpbnN0YW5jZS5wYXVzZWQpIHsgcmV0dXJuOyB9XG4gICAgaWYgKGluc3RhbmNlLmNvbXBsZXRlZCkgeyBpbnN0YW5jZS5yZXNldCgpOyB9XG4gICAgaW5zdGFuY2UucGF1c2VkID0gZmFsc2U7XG4gICAgYWN0aXZlSW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xuICAgIHJlc2V0VGltZSgpO1xuICAgIGlmICghcmFmKSB7IGVuZ2luZSgpOyB9XG4gIH07XG5cbiAgaW5zdGFuY2UucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRvZ2dsZUluc3RhbmNlRGlyZWN0aW9uKCk7XG4gICAgcmVzZXRUaW1lKCk7XG4gIH07XG5cbiAgaW5zdGFuY2UucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIGluc3RhbmNlLnJlc2V0KCk7XG4gICAgaW5zdGFuY2UucGxheSgpO1xuICB9O1xuXG4gIGluc3RhbmNlLnJlc2V0KCk7XG5cbiAgaWYgKGluc3RhbmNlLmF1dG9wbGF5KSB7IGluc3RhbmNlLnBsYXkoKTsgfVxuXG4gIHJldHVybiBpbnN0YW5jZTtcblxufVxuXG4vLyBSZW1vdmUgdGFyZ2V0cyBmcm9tIGFuaW1hdGlvblxuXG5mdW5jdGlvbiByZW1vdmVUYXJnZXRzRnJvbUFuaW1hdGlvbnModGFyZ2V0c0FycmF5LCBhbmltYXRpb25zKSB7XG4gIGZvciAodmFyIGEgPSBhbmltYXRpb25zLmxlbmd0aDsgYS0tOykge1xuICAgIGlmIChhcnJheUNvbnRhaW5zKHRhcmdldHNBcnJheSwgYW5pbWF0aW9uc1thXS5hbmltYXRhYmxlLnRhcmdldCkpIHtcbiAgICAgIGFuaW1hdGlvbnMuc3BsaWNlKGEsIDEpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVUYXJnZXRzKHRhcmdldHMpIHtcbiAgdmFyIHRhcmdldHNBcnJheSA9IHBhcnNlVGFyZ2V0cyh0YXJnZXRzKTtcbiAgZm9yICh2YXIgaSA9IGFjdGl2ZUluc3RhbmNlcy5sZW5ndGg7IGktLTspIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBhY3RpdmVJbnN0YW5jZXNbaV07XG4gICAgdmFyIGFuaW1hdGlvbnMgPSBpbnN0YW5jZS5hbmltYXRpb25zO1xuICAgIHZhciBjaGlsZHJlbiA9IGluc3RhbmNlLmNoaWxkcmVuO1xuICAgIHJlbW92ZVRhcmdldHNGcm9tQW5pbWF0aW9ucyh0YXJnZXRzQXJyYXksIGFuaW1hdGlvbnMpO1xuICAgIGZvciAodmFyIGMgPSBjaGlsZHJlbi5sZW5ndGg7IGMtLTspIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2NdO1xuICAgICAgdmFyIGNoaWxkQW5pbWF0aW9ucyA9IGNoaWxkLmFuaW1hdGlvbnM7XG4gICAgICByZW1vdmVUYXJnZXRzRnJvbUFuaW1hdGlvbnModGFyZ2V0c0FycmF5LCBjaGlsZEFuaW1hdGlvbnMpO1xuICAgICAgaWYgKCFjaGlsZEFuaW1hdGlvbnMubGVuZ3RoICYmICFjaGlsZC5jaGlsZHJlbi5sZW5ndGgpIHsgY2hpbGRyZW4uc3BsaWNlKGMsIDEpOyB9XG4gICAgfVxuICAgIGlmICghYW5pbWF0aW9ucy5sZW5ndGggJiYgIWNoaWxkcmVuLmxlbmd0aCkgeyBpbnN0YW5jZS5wYXVzZSgpOyB9XG4gIH1cbn1cblxuLy8gU3RhZ2dlciBoZWxwZXJzXG5cbmZ1bmN0aW9uIHN0YWdnZXIodmFsLCBwYXJhbXMpIHtcbiAgaWYgKCBwYXJhbXMgPT09IHZvaWQgMCApIHBhcmFtcyA9IHt9O1xuXG4gIHZhciBkaXJlY3Rpb24gPSBwYXJhbXMuZGlyZWN0aW9uIHx8ICdub3JtYWwnO1xuICB2YXIgZWFzaW5nID0gcGFyYW1zLmVhc2luZyA/IHBhcnNlRWFzaW5ncyhwYXJhbXMuZWFzaW5nKSA6IG51bGw7XG4gIHZhciBncmlkID0gcGFyYW1zLmdyaWQ7XG4gIHZhciBheGlzID0gcGFyYW1zLmF4aXM7XG4gIHZhciBmcm9tSW5kZXggPSBwYXJhbXMuZnJvbSB8fCAwO1xuICB2YXIgZnJvbUZpcnN0ID0gZnJvbUluZGV4ID09PSAnZmlyc3QnO1xuICB2YXIgZnJvbUNlbnRlciA9IGZyb21JbmRleCA9PT0gJ2NlbnRlcic7XG4gIHZhciBmcm9tTGFzdCA9IGZyb21JbmRleCA9PT0gJ2xhc3QnO1xuICB2YXIgaXNSYW5nZSA9IGlzLmFycih2YWwpO1xuICB2YXIgdmFsMSA9IGlzUmFuZ2UgPyBwYXJzZUZsb2F0KHZhbFswXSkgOiBwYXJzZUZsb2F0KHZhbCk7XG4gIHZhciB2YWwyID0gaXNSYW5nZSA/IHBhcnNlRmxvYXQodmFsWzFdKSA6IDA7XG4gIHZhciB1bml0ID0gZ2V0VW5pdChpc1JhbmdlID8gdmFsWzFdIDogdmFsKSB8fCAwO1xuICB2YXIgc3RhcnQgPSBwYXJhbXMuc3RhcnQgfHwgMCArIChpc1JhbmdlID8gdmFsMSA6IDApO1xuICB2YXIgdmFsdWVzID0gW107XG4gIHZhciBtYXhWYWx1ZSA9IDA7XG4gIHJldHVybiBmdW5jdGlvbiAoZWwsIGksIHQpIHtcbiAgICBpZiAoZnJvbUZpcnN0KSB7IGZyb21JbmRleCA9IDA7IH1cbiAgICBpZiAoZnJvbUNlbnRlcikgeyBmcm9tSW5kZXggPSAodCAtIDEpIC8gMjsgfVxuICAgIGlmIChmcm9tTGFzdCkgeyBmcm9tSW5kZXggPSB0IC0gMTsgfVxuICAgIGlmICghdmFsdWVzLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHQ7IGluZGV4KyspIHtcbiAgICAgICAgaWYgKCFncmlkKSB7XG4gICAgICAgICAgdmFsdWVzLnB1c2goTWF0aC5hYnMoZnJvbUluZGV4IC0gaW5kZXgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZnJvbVggPSAhZnJvbUNlbnRlciA/IGZyb21JbmRleCVncmlkWzBdIDogKGdyaWRbMF0tMSkvMjtcbiAgICAgICAgICB2YXIgZnJvbVkgPSAhZnJvbUNlbnRlciA/IE1hdGguZmxvb3IoZnJvbUluZGV4L2dyaWRbMF0pIDogKGdyaWRbMV0tMSkvMjtcbiAgICAgICAgICB2YXIgdG9YID0gaW5kZXglZ3JpZFswXTtcbiAgICAgICAgICB2YXIgdG9ZID0gTWF0aC5mbG9vcihpbmRleC9ncmlkWzBdKTtcbiAgICAgICAgICB2YXIgZGlzdGFuY2VYID0gZnJvbVggLSB0b1g7XG4gICAgICAgICAgdmFyIGRpc3RhbmNlWSA9IGZyb21ZIC0gdG9ZO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IE1hdGguc3FydChkaXN0YW5jZVggKiBkaXN0YW5jZVggKyBkaXN0YW5jZVkgKiBkaXN0YW5jZVkpO1xuICAgICAgICAgIGlmIChheGlzID09PSAneCcpIHsgdmFsdWUgPSAtZGlzdGFuY2VYOyB9XG4gICAgICAgICAgaWYgKGF4aXMgPT09ICd5JykgeyB2YWx1ZSA9IC1kaXN0YW5jZVk7IH1cbiAgICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgbWF4VmFsdWUgPSBNYXRoLm1heC5hcHBseShNYXRoLCB2YWx1ZXMpO1xuICAgICAgfVxuICAgICAgaWYgKGVhc2luZykgeyB2YWx1ZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uICh2YWwpIHsgcmV0dXJuIGVhc2luZyh2YWwgLyBtYXhWYWx1ZSkgKiBtYXhWYWx1ZTsgfSk7IH1cbiAgICAgIGlmIChkaXJlY3Rpb24gPT09ICdyZXZlcnNlJykgeyB2YWx1ZXMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uICh2YWwpIHsgcmV0dXJuIGF4aXMgPyAodmFsIDwgMCkgPyB2YWwgKiAtMSA6IC12YWwgOiBNYXRoLmFicyhtYXhWYWx1ZSAtIHZhbCk7IH0pOyB9XG4gICAgfVxuICAgIHZhciBzcGFjaW5nID0gaXNSYW5nZSA/ICh2YWwyIC0gdmFsMSkgLyBtYXhWYWx1ZSA6IHZhbDE7XG4gICAgcmV0dXJuIHN0YXJ0ICsgKHNwYWNpbmcgKiAoTWF0aC5yb3VuZCh2YWx1ZXNbaV0gKiAxMDApIC8gMTAwKSkgKyB1bml0O1xuICB9XG59XG5cbi8vIFRpbWVsaW5lXG5cbmZ1bmN0aW9uIHRpbWVsaW5lKHBhcmFtcykge1xuICBpZiAoIHBhcmFtcyA9PT0gdm9pZCAwICkgcGFyYW1zID0ge307XG5cbiAgdmFyIHRsID0gYW5pbWUocGFyYW1zKTtcbiAgdGwuZHVyYXRpb24gPSAwO1xuICB0bC5hZGQgPSBmdW5jdGlvbihpbnN0YW5jZVBhcmFtcywgdGltZWxpbmVPZmZzZXQpIHtcbiAgICB2YXIgdGxJbmRleCA9IGFjdGl2ZUluc3RhbmNlcy5pbmRleE9mKHRsKTtcbiAgICB2YXIgY2hpbGRyZW4gPSB0bC5jaGlsZHJlbjtcbiAgICBpZiAodGxJbmRleCA+IC0xKSB7IGFjdGl2ZUluc3RhbmNlcy5zcGxpY2UodGxJbmRleCwgMSk7IH1cbiAgICBmdW5jdGlvbiBwYXNzVGhyb3VnaChpbnMpIHsgaW5zLnBhc3NUaHJvdWdoID0gdHJ1ZTsgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHsgcGFzc1Rocm91Z2goY2hpbGRyZW5baV0pOyB9XG4gICAgdmFyIGluc1BhcmFtcyA9IG1lcmdlT2JqZWN0cyhpbnN0YW5jZVBhcmFtcywgcmVwbGFjZU9iamVjdFByb3BzKGRlZmF1bHRUd2VlblNldHRpbmdzLCBwYXJhbXMpKTtcbiAgICBpbnNQYXJhbXMudGFyZ2V0cyA9IGluc1BhcmFtcy50YXJnZXRzIHx8IHBhcmFtcy50YXJnZXRzO1xuICAgIHZhciB0bER1cmF0aW9uID0gdGwuZHVyYXRpb247XG4gICAgaW5zUGFyYW1zLmF1dG9wbGF5ID0gZmFsc2U7XG4gICAgaW5zUGFyYW1zLmRpcmVjdGlvbiA9IHRsLmRpcmVjdGlvbjtcbiAgICBpbnNQYXJhbXMudGltZWxpbmVPZmZzZXQgPSBpcy51bmQodGltZWxpbmVPZmZzZXQpID8gdGxEdXJhdGlvbiA6IGdldFJlbGF0aXZlVmFsdWUodGltZWxpbmVPZmZzZXQsIHRsRHVyYXRpb24pO1xuICAgIHBhc3NUaHJvdWdoKHRsKTtcbiAgICB0bC5zZWVrKGluc1BhcmFtcy50aW1lbGluZU9mZnNldCk7XG4gICAgdmFyIGlucyA9IGFuaW1lKGluc1BhcmFtcyk7XG4gICAgcGFzc1Rocm91Z2goaW5zKTtcbiAgICBjaGlsZHJlbi5wdXNoKGlucyk7XG4gICAgdmFyIHRpbWluZ3MgPSBnZXRJbnN0YW5jZVRpbWluZ3MoY2hpbGRyZW4sIHBhcmFtcyk7XG4gICAgdGwuZGVsYXkgPSB0aW1pbmdzLmRlbGF5O1xuICAgIHRsLmVuZERlbGF5ID0gdGltaW5ncy5lbmREZWxheTtcbiAgICB0bC5kdXJhdGlvbiA9IHRpbWluZ3MuZHVyYXRpb247XG4gICAgdGwuc2VlaygwKTtcbiAgICB0bC5yZXNldCgpO1xuICAgIGlmICh0bC5hdXRvcGxheSkgeyB0bC5wbGF5KCk7IH1cbiAgICByZXR1cm4gdGw7XG4gIH07XG4gIHJldHVybiB0bDtcbn1cblxuYW5pbWUudmVyc2lvbiA9ICczLjEuMCc7XG5hbmltZS5zcGVlZCA9IDE7XG5hbmltZS5ydW5uaW5nID0gYWN0aXZlSW5zdGFuY2VzO1xuYW5pbWUucmVtb3ZlID0gcmVtb3ZlVGFyZ2V0cztcbmFuaW1lLmdldCA9IGdldE9yaWdpbmFsVGFyZ2V0VmFsdWU7XG5hbmltZS5zZXQgPSBzZXRUYXJnZXRzVmFsdWU7XG5hbmltZS5jb252ZXJ0UHggPSBjb252ZXJ0UHhUb1VuaXQ7XG5hbmltZS5wYXRoID0gZ2V0UGF0aDtcbmFuaW1lLnNldERhc2hvZmZzZXQgPSBzZXREYXNob2Zmc2V0O1xuYW5pbWUuc3RhZ2dlciA9IHN0YWdnZXI7XG5hbmltZS50aW1lbGluZSA9IHRpbWVsaW5lO1xuYW5pbWUuZWFzaW5nID0gcGFyc2VFYXNpbmdzO1xuYW5pbWUucGVubmVyID0gcGVubmVyO1xuYW5pbWUucmFuZG9tID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7IHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFuaW1lO1xuIl19
