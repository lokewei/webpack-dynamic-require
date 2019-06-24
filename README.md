# Webpack Dynamic Require

```javascript

/**
 * @param name
 * @param baseUrl
 * @param hashed
 */
DynamicRequire('@ali/bgm-comp-optimize-tab', 'http://127.0.0.1:3333', true).then((Comp) => {
  console.log(Comp);
  // ReactDOM.render(<Comp />, document.getElementById('#id'));
});
```

`hashed` is now can be used with `webpack-named-moduleids-plugin`