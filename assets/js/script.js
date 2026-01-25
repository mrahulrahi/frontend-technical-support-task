// Offer selection and price management
(function() {
    'use strict';

    // Cache DOM elements
    const elements = {
        offerCards: document.querySelectorAll('.offer-card'),
        radioInputs: document.querySelectorAll('input[name="offer"]'),
        totalElement: document.querySelector('.total span'),
        addToCartBtn: document.querySelector('.add-to-cart-btn')
    };

    // Offer prices mapping
    const PRICES = {
        '1': '$10.00 USD',
        '2': '$18.00 USD',
        '3': '$24.00 USD'
    };

    // Initialize: Set default selection to offer 2 (Most Popular)
    function init() {
        const defaultRadio = document.querySelector('input[value="2"]');
        if (defaultRadio) {
            defaultRadio.checked = true;
            updateTotal('2');
        }
    }

    // Update total price display
    function updateTotal(offerValue) {
        if (elements.totalElement && PRICES[offerValue]) {
            elements.totalElement.textContent = PRICES[offerValue];
        }
    }

    // Handle offer card click
    function handleCardClick(event) {
        // Prevent triggering when clicking on interactive elements
        if (event.target.matches('select, option, input[type="radio"]')) {
            return;
        }

        const card = event.currentTarget;
        const radio = card.querySelector('input[name="offer"]');
        
        if (radio && !radio.checked) {
            radio.checked = true;
            updateTotal(radio.value);
        }
    }

    // Handle radio input change
    function handleRadioChange(event) {
        updateTotal(event.target.value);
    }

    // Handle add to cart
    function handleAddToCart() {
        const selectedRadio = document.querySelector('input[name="offer"]:checked');
        
        if (!selectedRadio) {
            alert('Please select an offer');
            return;
        }

        const offerNumber = selectedRadio.value;
        const price = PRICES[offerNumber];
        const unit = offerNumber === '1' ? 'Unit' : 'Units';
        
        // Get selected sizes and colors
        const selectedCard = document.querySelector(`[data-offer="${offerNumber}"]`);
        const selections = getSelections(selectedCard);
        
        // Build alert message
        let message = `Added to cart:\n${offerNumber} ${unit} - ${price}`;
        
        if (selections.length > 0) {
            message += '\n\nSelections:';
            selections.forEach((item, index) => {
                message += `\n#${index + 1}: ${item.size || 'No size'}, ${item.color || 'No color'}`;
            });
        }
        
        alert(message);
    }

    // Get all size and color selections from a card
    function getSelections(card) {
        if (!card) return [];
        
        const rows = card.querySelectorAll('.size-row');
        const selections = [];
        
        rows.forEach(row => {
            const sizeSelect = row.querySelector('select:first-of-type');
            const colorSelect = row.querySelector('select:last-of-type');
            
            if (sizeSelect && colorSelect) {
                const size = sizeSelect.value;
                const color = colorSelect.value;
                
                // Only add if at least one value is selected
                if (size || color) {
                    selections.push({ size, color });
                }
            }
        });
        
        return selections;
    }

    // Event delegation for better performance
    function attachEventListeners() {
        // Offer card clicks
        elements.offerCards.forEach(card => {
            card.addEventListener('click', handleCardClick);
        });

        // Radio input changes
        elements.radioInputs.forEach(radio => {
            radio.addEventListener('change', handleRadioChange);
        });

        // Add to cart button
        if (elements.addToCartBtn) {
            elements.addToCartBtn.addEventListener('click', handleAddToCart);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            attachEventListeners();
        });
    } else {
        init();
        attachEventListeners();
    }

})();