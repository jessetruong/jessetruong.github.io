

export const handleUserActions = () => {

    // Constants and global variables
    const imageWidth = 320;
    const backwardNavigationScrollDistance = -390;

    const arrowAnimationKeyFrames = [{
        backgroundColor: '#000000',
        transform: 'scale(1)'
    }, 
    {
        backgroundColor: '#434343', 
        transform:  'scale(1.2)'
    }];

    const arrowAnimationOptions = {
        duration: 500,
        iterations: 1,
    }

    // Variables to track application status / user input
    let selectedRow = 0;
    let selectedImageIndex = 0;

    let selectedImagePagePosition = 0;

    let imagesPerPage; // How many images can fit per row on screen
    
    // Create event listeners and designate handlers
    window.addEventListener('resize', handleWindowResize);
    window.onload = handleWindowOnLoad;
    document.onkeydown = handleKeyNavigation;

    // Ignore mouse input since we only care about keyboard navigation
    window.onmousedown = function(e) {
        e.preventDefault();
    }
    
    // Event handler functions
    function handleWindowOnLoad() {
        handleWindowResize();
    }

    function handleWindowResize() {
        imagesPerPage = Math.floor(window.innerWidth/imageWidth);
    }

    function handleKeyNavigation(e) {
        let horizonalIncrement = 0;
        let verticalIncrement = 0;
        switch (e.keyCode) {
            case 37: // Left
                horizonalIncrement--;
                break;
            case 38: // Up
                verticalIncrement--;
                break;
            case 39: // Right
                horizonalIncrement++;   
                break;
            case 40: // Down
                verticalIncrement++;
                break;
            default:
                break;
        }

        if (e.keyCode >= 37 && e.keyCode <= 40) {
            cleanCurrentSelection();
            selectedRow += verticalIncrement;
            selectedImageIndex += horizonalIncrement;
            selectedImagePagePosition += horizonalIncrement;
            focusOnNewSelection(horizonalIncrement, verticalIncrement);
        }
    }

    
    // Home page navigation functions
    function cleanCurrentSelection() {
        if (selectedRow >= 0) {
            const setImagesContainer = document.getElementById(`set_${selectedRow}_container`);        
            setImagesContainer.querySelector('.left-arrow').style.display = 'none';
            setImagesContainer.querySelector('.right-arrow').style.display = 'none';
        }
    }

    function focusOnNewSelection(horizonalIncrement, verticalIncrement) {
        handleVerticalMovement(verticalIncrement);
        handleHorizontalMovement(horizonalIncrement); 
        document.getElementById(`set_${selectedRow}_image_${selectedImageIndex}`).focus();
    }

    function handleVerticalMovement(verticalIncrement) {
        const numTotalSets = document.querySelectorAll('.set-container').length; 
        if (selectedRow < 0) {
            selectedRow = numTotalSets - 1;
        } else if (selectedRow >= numTotalSets) {
            selectedRow = 0;
        }

        const setImagesContainer = document.getElementById(`set_${selectedRow}_container`);

        // Show arrows of the active row
        const leftArrow = setImagesContainer.querySelector('.left-arrow');
        leftArrow.style.display = 'block';
        const rightArrow = setImagesContainer.querySelector('.right-arrow');
        rightArrow.style.display = 'block';

        const setImages = setImagesContainer.querySelector('.set-images');
        let currentScrollPosition = parseInt(getComputedStyle(setImages).getPropertyValue('--scroll-distance'), 10) || 0;
        
        if (verticalIncrement !== 0) {
            let scrollOffset;
            if (currentScrollPosition === backwardNavigationScrollDistance) {
                scrollOffset = setImages.querySelectorAll('.preview-image').length - 3;
            } else {
                scrollOffset = currentScrollPosition === 0 ? 0 : -currentScrollPosition / imageWidth;
            }
            selectedImageIndex = scrollOffset + selectedImagePagePosition;
        }
    }

    function handleHorizontalMovement(horizonalIncrement) {
        const setImagesContainer = document.getElementById(`set_${selectedRow}_container`);
        const leftArrow = setImagesContainer.querySelector('.left-arrow');
        const rightArrow = setImagesContainer.querySelector('.right-arrow');

        if (horizonalIncrement === 1) {
            rightArrow.animate(arrowAnimationKeyFrames, arrowAnimationOptions);
        } else if (horizonalIncrement ===  -1) {
            leftArrow.animate(arrowAnimationKeyFrames, arrowAnimationOptions);
        }

        const setImages = document.getElementById(`set_${selectedRow}_container`).querySelector('.set-images');
        const numTotalImages = setImages.querySelectorAll('.preview-image').length

        if (selectedImageIndex < 0) {
            selectedImageIndex =  numTotalImages - 1;
        } else if (selectedImageIndex > numTotalImages - 1) {
            selectedImageIndex = 0;
        }

        let currentScrollPosition = parseInt(getComputedStyle(setImages).getPropertyValue('--scroll-distance'), 10) || 0;
        
        if (horizonalIncrement !== 0 && !(selectedImagePagePosition <= Math.floor(imagesPerPage/2) && horizonalIncrement === 1)) {

            setImages.style.setProperty('--current-scroll-position',  currentScrollPosition + 'px');
            let scrollDistance = selectedImageIndex <= Math.floor(imagesPerPage/2) ? 0 : (Math.floor(imagesPerPage/2) - selectedImageIndex) * imageWidth;

            // Handle the next scroll after looping from backward from beginning to end
            if (currentScrollPosition === backwardNavigationScrollDistance) {
                currentScrollPosition = (Math.floor(imagesPerPage/2) - selectedImageIndex - 1) * imageWidth;
                setImages.style.setProperty('--current-scroll-position',  currentScrollPosition + 'px');
            }

            // Loop backward from the beginning to the end
            if (selectedImageIndex === numTotalImages - 1 && horizonalIncrement === -1) {
                scrollDistance = backwardNavigationScrollDistance;
            }

            // Animate the horizonal movement and handle new styling at the end of the animation
            const scrollAnimationFinished = () => {
                setImages.classList.add('scrolled');
                setImages.classList.remove('scrolling-image');
                setImages.removeEventListener('animationend', scrollAnimationFinished);
            }
            setImages.addEventListener('animationend', scrollAnimationFinished);
            
            setImages.style.setProperty('--scroll-distance',  scrollDistance + 'px');
            setImages.classList.add('scrolling-image');

            selectedImagePagePosition = selectedImageIndex < Math.floor(imagesPerPage/2) && selectedImageIndex >= 0 ?
                selectedImageIndex : Math.floor(imagesPerPage/2);
        }
    }
}