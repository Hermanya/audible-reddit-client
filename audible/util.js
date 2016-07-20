export function say (something) {
    return new Promise((resolve) => {
        let utterance = new SpeechSynthesisUtterance(something)
        utterance.addEventListener('end', () => {
            window.removeEventListener('keydown', skip)
            resolve()
        })
        setTimeout(() => speechSynthesis.speak(utterance), 0)
        window.addEventListener('keydown', skip)
        function skip () {
            speechSynthesis.cancel()
            resolve()
        }
    })
}

export function showConfusion (command) {
    return say(`Not sure what ${command || 'that'} means.`)
}

export function withHelp (commands, item) {
    let commandNames = Object.keys(commands)
    let message
    if (commandNames.length === 0) {
        message = 'There are no commands.'
    } else if (commandNames.length === 0) {
        message = `You can only ${commandNames[0]}.`
    } else {
        message = `You can ask to ${commandNames.slice(0, -1).join(', ')}, and ${commandNames.slice(-1)[0]}.`
    }
    commands.help = () => say(message).then(doCommand.bind('no context', commands, item))
    return commands
}

export function doCommand (commands, item) {
    let fail = (command) => showConfusion(command).then(() => doCommand(commands, item))
    return listen().then(command => (withHelp(commands, item)[command] || (() => fail(command)))(item))
}

export function listen () {
    return new Promise((resolve) => {
        let value = ''
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keypress', onKeyPress);
        function onKeyPress (event) {
            let character = String.fromCharCode(event.which)
            if (character === ' ') {
                say(value.split(' ').pop())
            }
            value += character
        }
        function onKeyDown (event) {
            if(event.keyCode == 8){
                event.preventDefault();
                let words = value.trim().split(' ')
                value = words.slice(0, -1).join(' ') + ' '
                say(`scratched ${words.pop()}`)
            } else if (event.keyCode == 13) {
                window.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('keypress', onKeyPress);
                resolve(value.trim())
            }
        }
    })
}

export function prompt (question) {
    return say(question).then(listen)
}

export function list (options, items) {
    options = options || {}
    let {toString, itemSpecificCommands, itemIndependentCommands} = options
    itemSpecificCommands.repeat = (item) => say(toString(item))
    let boundItemCommands = Object.keys(itemSpecificCommands).reduce((_, name) => {
        _[name] = (item) => itemSpecificCommands[name].call('no context', item).then(() => doCommand(commands, item))
        return _
    }, {})
    let commands
    function doItem (index) {
        let item = items[index]
        let next = () => {
            if (index === items.length - 1) {
                return say('This is last item.').then(() => doCommand(commands, item))
            } else {
                return doItem(index + 1)
            }
        }
        let prevous = () => {
            if (index === 0) {
                return say('This is first item.').then(() => doCommand(commands, item))
            } else {
                return doItem(index - 1)
            }
        }
        commands = Object.assign({}, boundItemCommands, itemIndependentCommands, {
            'return': prevous,
            '': next,
            'proceed': next,
        })
        return say(toString(item)).then(() => doCommand(commands, item))
    }
    return doItem(0)
}
