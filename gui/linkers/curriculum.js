const {PythonShell} = require('python-shell')
const {shell} = require('electron');
const path = require("path")

function get_curricula() {
    // this function sets all curricula as items of the dropdown in the navigation

    let dropdown = document.getElementById("curricula-dropdown");

    let pyshell = new PythonShell('util.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['print_all_currs']
    });

    pyshell.on('error', e => {
        console.log(e)
    });

    pyshell.on('message', (msg) => {
        let item = document.createElement('a');
        item.setAttribute('class', 'dropdown-item');
        item.setAttribute('href', `index.html?p=curriculum&c=${msg}`);
        item.innerHTML = msg;
        dropdown.appendChild(item);
    });

    pyshell.end(() => {
        let divider = document.createElement("div");
        divider.setAttribute('class', 'dropdown-divider');
        dropdown.appendChild(divider);
        let create = document.createElement("a");
        create.setAttribute('class', 'dropdown-item');
        create.setAttribute('href', `index.html?p=create`);
        create.innerHTML = 'Create New Curriculum'
        dropdown.appendChild(create);
    });
}

function create() {
    let name = document.getElementById('input').value;
    if (!name) {
        document.getElementById('warning').innerText = 'Invalid name!'
    } else {
        console.log(name);
        let pyshell = new PythonShell('curriculum.py', {
            scriptPath: path.join(__dirname, '..', '..', 'src'),
            pythonPath: '/miniconda3/envs/datascience/bin/python',
            args: ['create', `'${name}'`]
        });
        
        pyshell.on('error', e => {
            console.log(e)
        });

        let pyshell2;
        pyshell.end(() => {
            pyshell2 = new PythonShell('calendar.py', {
                scriptPath: path.join(__dirname, '..', '..', 'src'),
                pythonPath: '/miniconda3/envs/datascience/bin/python',
                args: ['create', `'${name}'`]
            });
            pyshell2.end(() => {
                window.location.href = `index.html?p=curriculum&c=${name}`;
            });
        })
        
    }
}

function move(name, index, dir) {
    let pyshell = new PythonShell('curriculum.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['move', `'${name}'`, index, dir]
    });

    pyshell.on('error', e => {
        console.log(e)
    });

    pyshell.end(get_curriculum);
}

function remove(name, index) {
    if (!confirm("Are you sure?")) {
        return
    }
    let pyshell = new PythonShell('curriculum.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['remove', `'${name}'`, index]
    });

    pyshell.on('error', e => {
        console.log(e)
    });

    pyshell.end(get_curriculum);
}

function get_curriculum() {

    let url = new URL(window.location.href);
    let name = url.searchParams.get("c");

    let header = document.getElementsByTagName("h1")[0];
    header.innerText = name;
    let lead = document.getElementsByClassName("lead")[0];
    lead.innerText = `Edit the ${name} curriculum!`
    
    let pyshell = new PythonShell('curriculum.py', {
        scriptPath: path.join(__dirname, '..', '..', 'src'),
        pythonPath: '/miniconda3/envs/datascience/bin/python',
        args: ['get', `'${name}'`]
    });

    pyshell.on('error', e => {
        console.log(e)
    });
    
    let tbody = document.getElementsByTagName("tbody")[0];
    // clear table
    // faster than innerHTML = '';
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    let counter = 1;
    pyshell.on('message', (msg) => {
        console.log(msg);
        let row = JSON.parse(msg);
        let tr = document.createElement('tr');
        let th = document.createElement('th');
        th.setAttribute("scope", "row");
        th.innerText = counter;
        counter++;
        tr.appendChild(th);
        // hours column
        let td = document.createElement('td');
        td.setAttribute("style", "text-align: right;")
        td.innerText = row.hours;
        tr.appendChild(td);
        // title column with link
        td = document.createElement('td');
        if (row.link != 'None') {
            if (!row.link.startsWith("http")) {
                row.link = "http://" + row.link
            }
            let a = document.createElement('a');
            a.setAttribute('href', row.link);
            a.setAttribute('class', 'row-link');
            a.innerText = row.title;
            td.appendChild(a);
        } else {
            td.innerText = row.title;
        }
        tr.appendChild(td);
        // content column
        td = document.createElement('td');
        td.innerText = row.content;
        tr.appendChild(td);
        // up arrow button
        td = document.createElement('td');
        td.setAttribute("style", "padding: 0!important;vertical-align: middle;");
        button = document.createElement('button');
        button.setAttribute("class", "btn text-primary");
        button.setAttribute("onclick", `move_course(\"${name}\", ${row.index}, \"up\")`)
        i = document.createElement('i');
        i.setAttribute("class", "fa fa-angle-up")
        button.appendChild(i);
        td.appendChild(button);
        tr.appendChild(td);
        // down arrow button
        td = document.createElement('td');
        td.setAttribute("style", "padding: 0!important;vertical-align: middle;");
        button = document.createElement('button');
        button.setAttribute("class", "btn text-primary");
        button.setAttribute("onclick", `move_course(\"${name}\", ${row.index}, \"down\")`)
        i = document.createElement('i');
        i.setAttribute("class", "fa fa-angle-down")
        button.appendChild(i);
        td.appendChild(button);
        tr.appendChild(td);
        // trash
        td = document.createElement('td');
        td.setAttribute("style", "padding: 0!important;vertical-align: middle;");
        button = document.createElement('button');
        button.setAttribute("class", "btn text-primary");
        button.setAttribute("onclick", `remove_course(\"${name}\", ${row.index})`)
        i = document.createElement('i');
        i.setAttribute("class", "fa fa-trash")
        button.appendChild(i);
        td.appendChild(button);
        tr.appendChild(td);
        
        tbody.appendChild(tr);
    });

    // Open links in browser
    $('body').on('click', 'a.row-link', (event) => {
        event.preventDefault();
        let link = event.target.href;
        shell.openExternal(link, {activate: true});
    });
}

function add() {
    let url = new URL(window.location.href);
    let name = url.searchParams.get("c");
    let hours = document.getElementById('hours-input').value;
    let title = document.getElementById('title-input').value;
    let content = document.getElementById('content-input').value;
    let link = document.getElementById('link-input').value;
    let fine = true;
    if (!hours) {
        document.getElementById('hours-warning').innerText = 'No input!';
        fine = false;
    } else if (hours <= 0) {
        document.getElementById('hours-warning').innerText = 'Hours must be positive!';
        fine = false;
    } else {
        document.getElementById('hours-warning').innerText = '';
    }
    if (!title) {
        document.getElementById('title-warning').innerText = 'No input!';
        fine = false;
    } else {
        document.getElementById('title-warning').innerText = '';
    }
    if (!content) {
        document.getElementById('content-warning').innerText = 'No input!';
        fine = false;
    } else {
        document.getElementById('content-warning').innerText = '';
    }
    if (!link) {
        link = 'None'
    }
    if (fine) {
        document.getElementById('title-input').value = '';
        document.getElementById('hours-input').value = '';
        document.getElementById('content-input').value = '';
        document.getElementById('link-input').value = '';
        console.log('fine');
        let pyshell = new PythonShell('curriculum.py', {
            scriptPath: path.join(__dirname, '..', '..', 'src'),
            pythonPath: '/miniconda3/envs/datascience/bin/python',
            args: ['add', `'${name}'`, hours, `'${title}'`, link, `'${content}'`]
        });
        
        pyshell.on('error', e => {
            console.log(e)
        });
        
        pyshell.on('message', msg => {
            console.log(msg)
        });

        pyshell.end(get_curriculum)
    }
}

module.exports = {
    get_curricula: get_curricula,
    get_curriculum: get_curriculum,
    create_curriculum: create,
    move_course: move,
    remove_course: remove,
    add_course: add,
}