const {PythonShell} = require('python-shell');
const path = require("path");

function go_through_calendar(calendar, index, month, year) {
    let checks = document.getElementById("check-calendar")
    // create checkbox
    let div = document.createElement('div');
    div.setAttribute('class', 'form-check');
    checks.appendChild(div);
    let label = document.createElement('label');
    div.appendChild(label);
    let input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', `checkbox-${index}`);
    input.setAttribute('checked', true);
    label.appendChild(input);
    let i = document.createElement('i');
    i.setAttribute('class', 'fa fa-check-square mr-1');
    label.appendChild(i);
    let span = document.createElement('span');
    span.setAttribute('class', 'label-text');
    span.innerText = calendar.name;
    label.appendChild(span);
    
    for (let event of calendar.events) {
        // circle
        if (event.year.toString() == year && event.month.toString() == month) {
            // event in this month
            let icon_div = document.getElementById(`icon-div-${event.day}`)
            if (icon_div.childElementCount == 3) continue;
            else if (icon_div.childElementCount == 2) {
                let span = document.createElement('span');
                span.innerText = '...';
                span.setAttribute("class", `circle-${index}`);
                icon_div.appendChild(span);
            } else {
                let i = document.createElement('i');
                i.setAttribute('class', `fa fa-circle circle-${index} pr-1`);
                icon_div.appendChild(i);
            }
        }
    }
}

function include_events(calendars, month, year) {
    let checks = document.getElementById("check-calendar")
    $(checks).empty();
    // clear circle
    for (let icons_div of document.getElementsByClassName("icons")) {
        $(icons_div).empty();
    }

    let counter = 1;
    for (let calendar of calendars) {
        go_through_calendar(calendar, counter, month, year);
        counter++;
    }
}

function create_month_calendar(matrix, today) {
    let month_cal = document.getElementById("calendar-month");
    // clear month calendar
    while (month_cal.firstElementChild != month_cal.lastElementChild) {
        month_cal.removeChild(month_cal.lastElementChild);
    }
    // create weeks/days
    for (let week_li of matrix) {
        let week_el = document.createElement('div');
        week_el.setAttribute("class", "calendar__week")
        for (let day of week_li) {
            let day_el = document.createElement('div');
            if (day == today) {
                day_el.setAttribute("class", "calendar__day today")
            } else {
                day_el.setAttribute("class", "calendar__day")
            }
            if (day != 0) {
                let icons = document.createElement('div');
                icons.setAttribute("class", "icons mb-1 mr-1");
                icons.setAttribute("id", `icon-div-${day}`);
                day_el.innerText = day;
                day_el.appendChild(icons)
            }
            week_el.appendChild(day_el);
        }
        month_cal.appendChild(week_el);
    }
}

function set_selects(current_month, current_year) {
    let year_select = document.getElementById("year-select")
    var opts = year_select.options;
    for (let j = 0; j < opts.length; j++) {
        if (opts[j].attributes.val.value == current_year) {
            year_select.selectedIndex = j;
            break;
        }
    }
    let month_select = document.getElementById("month-select")
    var opts = month_select.options;
    for (let j = 0; j < opts.length; j++) {
        if (opts[j].attributes.val.value == current_month) {
            month_select.selectedIndex = j;
            break;
        }
    }
}

function update_calendar(calendars, month, year, today) {
    let matrix_shell = new PythonShell('util.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['get_month_matrix', year, month]
    });
    matrix_shell.on('error', e => console.log(e));

    matrix_shell.on('message', msg => {
        create_month_calendar(JSON.parse(msg), today);
    });
    matrix_shell.end(() => include_events(calendars, month, year));
}

function link() {
    let today_shell = new PythonShell('util.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['today']
    });
    today_shell.on('error', e => console.log(e));

    let counter = 0;
    let today = {};
    today_shell.on('message', (msg) => {
        switch (counter) {
            case 0:
                today.day = JSON.parse(msg); // to int
                break;
            case 1:
                today.month = JSON.parse(msg); // to int
                break;    
            case 2:
                today.year = JSON.parse(msg); // to int
                break;
        }
        counter++;
    });

    today_shell.end(() => {
        set_selects(today.month, today.year)
        let matrix_shell = new PythonShell('util.py', {
            scriptPath: path.join(__dirname, '..', '..', 'src'),
            pythonPath: '/miniconda3/envs/datascience/bin/python',
            args: ['get_month_matrix', today.year, today.month]
        });
        matrix_shell.on('error', e => console.log(e));
    
        matrix_shell.on('message', msg => create_month_calendar(JSON.parse(msg), today.day));
    
        matrix_shell.end(() => {
            let calendar_shell = new PythonShell('util.py', {
                scriptPath: path.join(__dirname, '..', '..', 'src'),
                pythonPath: '/miniconda3/envs/datascience/bin/python',
                args: ['get_all_cals']
            });
            calendar_shell.on('error', e => console.log(e));
            
            let calendars;
            calendar_shell.on('message', msg => calendars = JSON.parse(msg));
    
            calendar_shell.end(() => {
                include_events(calendars, today.month, today.year);
                
                // JQUERY
    
                // jquery
                // show/hide circles
                $('.form-check label input').click((e) => {
                    let checkbox_id = e.target.id
                    let calendar_index = checkbox_id.substr(checkbox_id.length-1, 1)
                    if ($(e.target).is(':checked')) {
                        $(`.circle-${calendar_index}`).show();
                    } else {
                        $(`.circle-${calendar_index}`).hide();
                    }
                });
                // change calendar
                $('.custom-select').change(() => {
                    // clear checks
                    let month = document.getElementById("month-select").selectedOptions[0].attributes.val.value;
                    let year = document.getElementById("year-select").selectedOptions[0].attributes.val.value;
                    month = JSON.parse(month);
                    year = JSON.parse(year);

                    if (month == today.month && year == today.year) {
                        update_calendar(calendars, month, year, today.day);
                    } else { // no today in this month
                        update_calendar(calendars, month, year, -1);
                    }
                });
                // today button
                $('#btn-today').click(() => {
                    set_selects(today.month, today.year)
                    update_calendar(calendars, today.month, today.year, today.day);
                });
            });
            
        });
    });
}

module.exports = {
    link: link
}