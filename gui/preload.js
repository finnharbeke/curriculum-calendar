const {get_curricula, get_curriculum, create_curriculum, move_course, remove_course, add_course} = require('./linkers/curriculum')
const {link} = require('./linkers/calendar');
const {soonest} = require('./linkers/home')

window.addEventListener('DOMContentLoaded', () => {
    const $ = require('jquery');
    // load nav bar
    $('#nav').load('html/nav.html', get_curricula)
    
    // load page specific content
    let url = new URL(window.location.href);
    let path = url.searchParams.get("p");
    if (!path) path = 'home';
    $('#content').load(`html/${path}.html`, () => {
        // file-specific linkers
        switch (path) {
            case 'curriculum':
                get_curriculum();
                break;

            case 'home':
                soonest(10);
                break;
    
            case 'calendar':
                link();
                break;

            default:
                console.log('unknown page', path);
        }
    });

    // Any button gets executed here
    $('body').on('click', 'button', (event) => {
        event.preventDefault();
        if (event.currentTarget.attributes.onclick) {
            eval(event.currentTarget.attributes.onclick.value);
        }
    });

});
