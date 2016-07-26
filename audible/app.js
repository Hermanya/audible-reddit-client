import {say, prompt, doCommand, list} from './util'
import {selectReddit, fetchPostsIfNeeded, invalidateReddit} from '../programmable/actions'

export default (store) => {
    let unsubscribe = store.subscribe(() => {
        let {
            postsByReddit: reddits,
            selectedReddit: name
        } = store.getState()
        let reddit = reddits[name]
        if (reddit.didInvalidate) {
            say(`${name} invalidated.`)
        } if (reddit.isFetching) {
            say(`${name} is fetching.`)
        } else {
            say(`Listing ${name}.`).then(() => list({
                toString: post => post.title,
                itemSpecificCommands: {
                    'elaborate': post => say(post.selftext || 'This is an external link.')
                },
                itemIndependentCommands: {
                    'select reddit': () => {
                        prompt('Which one?').then(nextReddit => {
                            store.dispatch(selectReddit(nextReddit))
                        })
                    },
                    'refresh': () => {
                        store.dispatch(invalidateReddit(store.getState().selectReddit))
                        store.dispatch(fetchPostsIfNeeded(store.getState().selectReddit))
                    }
                }
            }, reddit.items))
        }
    })
    say(`Welcome to ${document.title}; type help to hear what you can do.`)
    debugger;
    return Promise.resolve()
}
