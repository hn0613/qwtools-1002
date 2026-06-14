/**
 * choose_file.html.js
 *
 * Client-side filtering for the file chooser directory listing.
 * Filters listing items by YAML filename in real time as the user types.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var filterInput = document.getElementById('file-filter');
    if (!filterInput) return;

    var listing = document.getElementById('directory_listing');
    if (!listing) return;

    var items = listing.querySelectorAll('.listing-item');
    var countSpan = document.getElementById('filter-count');

    function applyFilter() {
      var query = filterInput.value.toLowerCase().trim();
      var visible = 0;

      for (var i = 0; i < items.length; i++) {
        var name = (items[i].getAttribute('data-name') || '').toLowerCase();
        var matches = !query || name.indexOf(query) !== -1;
        items[i].style.display = matches ? '' : 'none';
        if (matches) visible++;
      }

      if (countSpan) {
        if (query) {
          countSpan.textContent = visible + ' of ' + items.length + ' shown';
        } else {
          countSpan.textContent = '';
        }
      }

      // Show/hide dividers based on adjacent visible items
      var dividers = listing.querySelectorAll('.listing-divider');
      for (var d = 0; d < dividers.length; d++) {
        var next = dividers[d].nextElementSibling;
        var hasVisibleSibling = false;
        while (next && !next.classList.contains('listing-divider')) {
          if (next.classList.contains('listing-item') && next.style.display !== 'none') {
            hasVisibleSibling = true;
            break;
          }
          next = next.nextElementSibling;
        }
        dividers[d].style.display = hasVisibleSibling ? '' : 'none';
      }
    }

    filterInput.addEventListener('input', applyFilter);

    // Clear filter on Escape
    filterInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        filterInput.value = '';
        applyFilter();
        filterInput.blur();
      }
    });
  });
})();
