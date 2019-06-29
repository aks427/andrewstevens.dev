---
title: "useApi React Hook"
date: "2019-06-29"
---

One of the most common React [Hooks](https://reactjs.org/docs/hooks-overview.html) that I've found myself using is one to handle api calls.

For this post we're going to use [axios](https://github.com/axios/axios) for our HTTP calls, but something similar could be done with the native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), or various other methods.

Without using a custom hook, you would probably do something similar to this:

```javascript
const url = "some url";

const [loading, setLoading] = useState(false);
const [result, setResult] = useState(false);
const [error, setError] = useState();

useEffect(() => {
  setLoading(true);
  axios.get(url).then(r => {
    setResult(r.data);
    setLoading(false);
  });
}, [url]);
```

This is a very basic example that has a number of issues, including not handling errors. It's already quite a bit a few lines of code, and is obviously not reusable.

To convert this example to a custom hook, it would look like this:

```javascript
function useApi(url) {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(url).then(r => {
      setResult(r.data);
      setLoading(false);
    });
  }, [url]);

  return [result, loading];
}
```

Our component could then call it like this:

```javascript
const url = "some url";
const [loading, result] = useApi(url);
```

If `url` changes across different renders, it will trigger additional api calls, since `url` a dependency to the `useEffect` hook. The issue our code currently has is that multiple changes to the `url` variable in quick succession won't guarantee that the latest call will be the result state.

What we need to do is return a cleanup function from `useEffect` that marks the current request as stale.

```javascript
function useApi(url) {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios.get(url).then(r => {
      if (!cancelled) {
        setResult(r.data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return [result, loading];
}
```

This will prevent stale requests from updating the result state. A potential improvement here would be to actually cancel the HTTP request using a cancel token: https://github.com/axios/axios#cancellation

Another common thing I've needed is the ability to manually trigger the api call again. A good example would be a page with a list of resources, and wanting to refresh the list from a callback after creating a new resource.

To do this we'll simply keep a number in state that's a dependency to the useEffect, that we increment every time we want to force a refresh.

```javascript
function useApi(url) {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = () => {
    setRefreshIndex(refreshIndex + 1);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios.get(url).then(r => {
      if (!cancelled) {
        setResult(r.data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [url, refreshIndex]);

  return [result, loading, refresh];
}
```

It could be then used in a way similar to this:

```javascript
const url = "some url";
const [loading, result, refresh] = useApi(url);

return <button onClick={refresh} />;
```

Another thing I've needed to do is modify the result set without doing a refresh. An example of this would be a list of resources that had an enable/disable toggle on them. Instead of refreshing the entire list, it can be efficient to modify just the `enabled` property for the item in our list and then update the state. The way I've handled this is to actually return the `setResult` function from the hook. This enables any component that is using the hook to update the result state without having to keep a separate modified copy of the state.

I've also found that sometimes I want to skip the api call when the page first loads. For example, there could be another api call that we need to get an ID from before we can properly formulate our URL. Because we can't conditionally call a hook, I added a second parameter to the hook that skips doing the call if it is true.

Here is the full useApi hook that contains all of these features, plus basic error handling:

```javascript{numberLines: true}
import { useState, useEffect } from "react";
import axios from "axios";

export function useApi(url, skip) {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState();
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = () => {
    setRefreshIndex(refreshIndex + 1);
  };

  useEffect(() => {
    let cancelled = false;
    if (skip) {
      setResult(null);
      setLoading(false);
      setLoaded(false);
    } else {
      setLoading(true);
      axios
        .get(url)
        .then(r => {
          if (!cancelled) {
            setResult(r.data);
            setLoading(false);
            setLoaded(true);
          }
        })
        .catch(error => {
          setLoading(false);
          if (error.response) {
            setError(error.response.data);
          } else {
            setError(error.message);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [url, refreshIndex]);

  return [result, loading, loaded, error, refresh, setResult];
}
```

This example doesn't handle authentication. One way to handle that would be to add parameters to the hook for additional options, or to update the hook to add the authentication header from some global state. I typically have an api helper function that I use globally in the app that handles that.
