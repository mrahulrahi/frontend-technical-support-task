// Offer selection, price management, validation, and toast system
(function () {
    'use strict';

    // Offer data configuration
    const OFFERS = {
        '1': {
            price: '$10.00 USD',
            original: '$24.00 USD',
            savings: 'Save $14.00 USD',
            units: 1
        },
        '2': {
            price: '$18.00 USD',
            original: '$48.00 USD',
            savings: 'Save $30.00 USD',
            units: 2
        },
        '3': {
            price: '$24.00 USD',
            original: '$72.00 USD',
            savings: 'Save $48.00 USD',
            units: 3
        }
    };

    // Cache DOM elements
    const elements = {
        offerCards: document.querySelectorAll('.offer-card'),
        radioInputs: document.querySelectorAll('input[name="offer"]'),
        totalElement: document.getElementById('total-price'),
        savingsElement: document.getElementById('savings-tag'),
        addToCartBtn: document.getElementById('add-to-cart-btn'),
        toastContainer: document.getElementById('toast-container')
    };

    // Initialize UI state
    function init() {
        const checkedRadio = document.querySelector('input[name="offer"]:checked') || document.querySelector('input[value="2"]');
        if (checkedRadio) {
            checkedRadio.checked = true;
            updateSelectionState(checkedRadio.value);
        }
    }

    // Update selection state, total price display, and savings tag
    function updateSelectionState(offerValue) {
        const offerData = OFFERS[offerValue];
        if (!offerData) return;

        // Update footer price & savings tag
        if (elements.totalElement) {
            elements.totalElement.textContent = offerData.price;
        }
        if (elements.savingsElement) {
            elements.savingsElement.textContent = offerData.savings;
        }

        // Synchronize card ARIA states and CSS classes
        elements.offerCards.forEach(card => {
            const cardOffer = card.getAttribute('data-offer');
            const isSelected = cardOffer === offerValue;
            
            card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            
            const radio = card.querySelector('input[name="offer"]');
            if (radio) {
                radio.checked = isSelected;
            }
        });
    }

    // Handle offer card click
    function handleCardClick(event) {
        // Allow select interaction without re-triggering card selection behavior
        if (event.target.matches('select, option, input[type="radio"]')) {
            return;
        }

        const card = event.currentTarget;
        const offerValue = card.getAttribute('data-offer');
        if (offerValue) {
            updateSelectionState(offerValue);
        }
    }

    // Handle keyboard accessibility (Enter/Space key on card)
    function handleCardKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            // Avoid toggling if focusing directly inside a select dropdown
            if (event.target.tagName === 'SELECT') return;

            event.preventDefault();
            const card = event.currentTarget;
            const offerValue = card.getAttribute('data-offer');
            if (offerValue) {
                updateSelectionState(offerValue);
            }
        }
    }

    // Handle radio input change directly
    function handleRadioChange(event) {
        updateSelectionState(event.target.value);
    }

    // Get size and color selections from an active card
    function getSelections(card) {
        if (!card) return { items: [], isValid: true, invalidSelects: [] };

        const rows = card.querySelectorAll('.size-row:not(.header-row)');
        const items = [];
        const invalidSelects = [];
        let isValid = true;

        rows.forEach((row, index) => {
            const sizeSelect = row.querySelector('select[aria-label*="Size"]');
            const colorSelect = row.querySelector('select[aria-label*="Colour"]');

            const size = sizeSelect ? sizeSelect.value : '';
            const color = colorSelect ? colorSelect.value : '';

            // Check if user left options unselected
            if (!size && sizeSelect) {
                isValid = false;
                invalidSelects.push(sizeSelect);
            }
            if (!color && colorSelect) {
                isValid = false;
                invalidSelects.push(colorSelect);
            }

            items.push({
                unit: index + 1,
                size: size || 'Not selected',
                color: color || 'Not selected'
            });
        });

        return { items, isValid, invalidSelects };
    }

    // Handle Add to Cart button click
    function handleAddToCart() {
        const selectedRadio = document.querySelector('input[name="offer"]:checked');
        if (!selectedRadio) {
            showToast('Warning', 'Please select an offer package.', 'warning');
            return;
        }

        const offerNumber = selectedRadio.value;
        const offerData = OFFERS[offerNumber];
        const selectedCard = document.querySelector(`.offer-card[data-offer="${offerNumber}"]`);
        
        const { items, isValid, invalidSelects } = getSelections(selectedCard);

        // Highlight any unselected options
        clearValidationErrors();
        if (!isValid) {
            invalidSelects.forEach(select => {
                select.classList.add('invalid-field');
                // Remove invalid state on change
                select.addEventListener('change', function clearError() {
                    select.classList.remove('invalid-field');
                    select.removeEventListener('change', clearError);
                });
            });

            showToast('Selection Required', 'Please select Size and Colour for all items.', 'warning');
            return;
        }

        // Format selection summary for toast
        const unitText = offerData.units === 1 ? '1 Unit' : `${offerData.units} Units`;
        let detailsHtml = `<strong>${unitText} (${offerData.price})</strong><br>`;
        items.forEach(item => {
            detailsHtml += `#${item.unit}: Size <strong>${item.size}</strong>, Color <strong>${item.color}</strong><br>`;
        });

        // Add button loading animation effect
        const btn = elements.addToCartBtn;
        if (btn) {
            btn.style.opacity = '0.8';
            btn.style.pointerEvents = 'none';
            btn.querySelector('.btn-text').textContent = 'Adding...';

            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'all';
                btn.querySelector('.btn-text').textContent = 'Add to Cart';
                showToast('Success!', detailsHtml, 'success');
            }, 450);
        }
    }

    // Remove red borders from select fields
    function clearValidationErrors() {
        const invalidFields = document.querySelectorAll('.invalid-field');
        invalidFields.forEach(field => field.classList.remove('invalid-field'));
    }

    // Toast notification manager
    function showToast(title, message, type = 'success') {
        if (!elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = type === 'success' ? '✓' : (type === 'warning' ? '⚠️' : 'ℹ️');

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close notification">&times;</button>
        `;

        // Close button handler
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            removeToast(toast);
        });

        elements.toastContainer.appendChild(toast);

        // Auto remove toast after 4 seconds
        setTimeout(() => {
            removeToast(toast);
        }, 4000);
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Attach event listeners
    function attachEventListeners() {
        elements.offerCards.forEach(card => {
            card.addEventListener('click', handleCardClick);
            card.addEventListener('keydown', handleCardKeydown);
        });

        elements.radioInputs.forEach(radio => {
            radio.addEventListener('change', handleRadioChange);
        });

        if (elements.addToCartBtn) {
            elements.addToCartBtn.addEventListener('click', handleAddToCart);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
            attachEventListeners();
        });
    } else {
        init();
        attachEventListeners();
    }
})();