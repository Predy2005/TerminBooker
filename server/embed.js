(function() {
  'use strict';

  // Get script tag and its data attributes
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var config = {
    org: script.getAttribute('data-org'),
    service: script.getAttribute('data-service') || '',
    lang: script.getAttribute('data-lang') || 'cs',
    theme: script.getAttribute('data-theme') || 'light',
    accent: script.getAttribute('data-accent') || '#3b82f6',
    width: script.getAttribute('data-width') || '100%',
    height: script.getAttribute('data-height') || 'auto'
  };

  if (!config.org) {
    console.error('Bookli.cz: Missing required data-org attribute');
    return;
  }

  // Create container
  var container = document.createElement('div');
  container.id = 'bookli-widget-' + Math.random().toString(36).substr(2, 9);
  container.style.width = config.width;
  container.style.minHeight = '400px';
  container.style.border = 'none';
  container.style.overflow = 'hidden';

  // Create iframe
  var iframe = document.createElement('iframe');
  var embedUrl = new URL('/embed', window.location.origin);
  embedUrl.searchParams.set('org', config.org);
  if (config.service) embedUrl.searchParams.set('service', config.service);
  embedUrl.searchParams.set('lang', config.lang);
  embedUrl.searchParams.set('theme', config.theme);
  embedUrl.searchParams.set('accent', config.accent);

  iframe.src = embedUrl.toString();
  iframe.style.width = '100%';
  iframe.style.height = config.height === 'auto' ? '400px' : config.height;
  iframe.style.border = 'none';
  iframe.style.display = 'block';
  iframe.setAttribute('sandbox', 'allow-forms allow-scripts allow-popups allow-top-navigation-by-user-activation allow-same-origin');
  iframe.setAttribute('loading', 'lazy');

  // Auto-resize functionality
  function handleMessage(event) {
    // Security check - only accept messages from our domain
    if (event.origin !== window.location.origin) return;
    
    if (event.data && typeof event.data === 'object') {
      switch (event.data.type) {
        case 'bookli-resize':
          if (config.height === 'auto' && event.data.height) {
            iframe.style.height = event.data.height + 'px';
          }
          break;
          
        case 'bookli-payment':
          if (event.data.url) {
            window.open(event.data.url, '_blank', 'noopener,noreferrer');
          }
          break;
          
        case 'bookli-success':
          // Fire custom event for successful booking
          var successEvent = new CustomEvent('bookli:success', {
            detail: event.data.booking
          });
          window.dispatchEvent(successEvent);
          break;
          
        case 'bookli-error':
          // Fire custom event for booking error
          var errorEvent = new CustomEvent('bookli:error', {
            detail: { message: event.data.message }
          });
          window.dispatchEvent(errorEvent);
          break;
      }
    }
  }

  // Listen for messages from iframe
  if (window.addEventListener) {
    window.addEventListener('message', handleMessage, false);
  } else if (window.attachEvent) {
    window.attachEvent('onmessage', handleMessage);
  }

  // Fallback for no JavaScript
  var noscript = document.createElement('noscript');
  noscript.innerHTML = '<p>Pro zobrazení rezervačního formuláře je potřeba mít povolený JavaScript. ' +
    '<a href="/booking/' + config.org + '" target="_blank" rel="noopener">Otevřít rezervace</a></p>';
  
  container.appendChild(iframe);
  container.appendChild(noscript);

  // Insert widget after the script tag
  if (script.parentNode) {
    script.parentNode.insertBefore(container, script.nextSibling);
  }

  // Cleanup function (optional)
  window.bookliCleanup = function() {
    if (window.removeEventListener) {
      window.removeEventListener('message', handleMessage, false);
    } else if (window.detachEvent) {
      window.detachEvent('onmessage', handleMessage);
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

})();