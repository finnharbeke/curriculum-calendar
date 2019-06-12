const {PythonShell} = require('python-shell');
const path = require("path");

function soonest(count) {
    let soonest_shell = new PythonShell('util.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['soonest', count]
    });
    soonest_shell.on('error', e => console.log(e))

    let container = document.getElementById('events-container');

    soonest_shell.on('message', msg => {
        let event = JSON.parse(msg);
        let item = document.createElement('li');
        item.setAttribute("class", `events__item event-${event.index}`);
        container.appendChild(item);

        let left = document.createElement('div');
        left.setAttribute("class", "events__item--left");
        item.appendChild(left);

        let name = document.createElement('span');
        name.setAttribute("class", "events__name");
        name.innerText = event.name;
        left.appendChild(name);

        let hours = document.createElement('span');
        hours.setAttribute("class", "events__hours");
        left.appendChild(hours);

        let table = document.createElement('table');
        hours.appendChild(table);

        for (let course of event.courses) {
            let tr = document.createElement('tr');
            table.appendChild(tr);
            let td = document.createElement('td');
            if (course.hours == 1.0) td.innerText = '1 hour';
            else td.innerText = `${course.hours} hours`;
            tr.appendChild(td);
            td = document.createElement('td');
            if (course.link != 'None') {
                if (!course.link.startsWith("http")) {
                    course.link = "http://" + course.link
                }
                let a = document.createElement('a');
                a.setAttribute('href', course.link);
                a.innerText = course.title;
                td.appendChild(a);
            } else {
                td.innerText = course.title;
            }
            tr.appendChild(td);
        }

        let tag = document.createElement('span');
        tag.setAttribute("class", "events__tag");
        tag.innerText = event.start.substr(event.start.length-5, 5)
        item.appendChild(tag)
    });

    // Open links in browser
    $('body').on('click', 'events__item a', (event) => {
        event.preventDefault();
        let link = event.target.href;
        shell.openExternal(link, {activate: true});
    });
}

module.exports = {
    soonest: soonest,
};