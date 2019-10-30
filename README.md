# Webpack Dynamic Require

```javascript

/**
 * @param name
 * @param baseUrl
 * @param hashed
 */
import DynamicRequire from 'webpack-dynamic-require';

const dr = new DynamicRequire({
  baseUrl: 'http://127.0.0.1:3333',
  hashed: true
});


// xxxx = lib name in package.json
dr.require('xxxx').then((Comp) => {
  console.log(Comp);
  // ReactDOM.render(<Comp />, document.getElementById('#id'));
});

// uninstall assets

dr.uninsall();
```

`hashed` is now can be used with `webpack-named-moduleids-plugin`