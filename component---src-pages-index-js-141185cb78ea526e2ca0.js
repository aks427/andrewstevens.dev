(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{144:function(t,e,n){"use strict";n.r(e),n.d(e,"query",function(){return d});var a=n(8),r=(n(0),n(148)),i=n(149),o=n(150),s={name:"9w33so",styles:"display:inline-block;border-bottom:1px solid;"},u={name:"nn640c",styles:"text-decoration:none;color:inherit;"},c={name:"qp4dny",styles:"color:#bbb;"};e.default=function(t){var e=t.data;return Object(a.b)(o.a,null,Object(a.b)("div",null,Object(a.b)("h1",{css:s},"test test"),Object(a.b)("h4",null,e.allMarkdownRemark.totalCount," Posts"),e.allMarkdownRemark.edges.map(function(t){var e=t.node;return Object(a.b)("div",{key:e.id},Object(a.b)(r.Link,{to:e.fields.slug,css:u},Object(a.b)("h3",{css:Object(a.a)("margin-bottom:",Object(i.a)(.25),";")},e.frontmatter.title," ",Object(a.b)("span",{css:c},"— ",e.frontmatter.date)),Object(a.b)("p",null,e.excerpt)))})))};var d="2068765159"},147:function(t,e,n){var a;t.exports=(a=n(152))&&a.default||a},148:function(t,e,n){"use strict";n.r(e),n.d(e,"graphql",function(){return y}),n.d(e,"StaticQueryContext",function(){return f}),n.d(e,"StaticQuery",function(){return p}),n.d(e,"useStaticQuery",function(){return h});var a=n(8),r=n(0),i=n.n(r),o=n(4),s=n.n(o),u=n(146),c=n.n(u);n.d(e,"Link",function(){return c.a}),n.d(e,"withPrefix",function(){return u.withPrefix}),n.d(e,"navigate",function(){return u.navigate}),n.d(e,"push",function(){return u.push}),n.d(e,"replace",function(){return u.replace}),n.d(e,"navigateTo",function(){return u.navigateTo});var d=n(147),l=n.n(d);n.d(e,"PageRenderer",function(){return l.a});var b=n(33);n.d(e,"parsePath",function(){return b.a});var f=i.a.createContext({}),p=function(t){return Object(a.b)(f.Consumer,null,function(e){return t.data||e[t.query]&&e[t.query].data?(t.render||t.children)(t.data?t.data.data:e[t.query].data):Object(a.b)("div",null,"Loading (StaticQuery)")})},h=function(t){i.a.useContext;var e=i.a.useContext(f);if(e[t]&&e[t].data)return e[t].data;throw new Error("The result of this StaticQuery could not be fetched.\n\nThis is likely a bug in Gatsby and if refreshing the page does not fix it, please open an issue in https://github.com/gatsbyjs/gatsby/issues")};function y(){throw new Error("It appears like Gatsby is misconfigured. Gatsby related `graphql` calls are supposed to only be evaluated at compile time, and then compiled away,. Unfortunately, something went wrong and the query was left in the compiled code.\n\n.Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.")}p.propTypes={data:s.a.object,query:s.a.string.isRequired,render:s.a.func,children:s.a.func}},149:function(t,e,n){"use strict";n.d(e,"a",function(){return u});var a=n(154),r=n.n(a),i=n(155),o=n.n(i),s=new r.a(o.a),u=s.rhythm},150:function(t,e,n){"use strict";var a=n(8),r=n(151),i=(n(0),n(148)),o=n(153),s=n(149),u={name:"146q31f",styles:"float:right;"};e.a=function(t){var e=t.children,n=r.data;return Object(a.b)("div",{css:Object(a.a)("margin:0 auto;max-width:700px;padding:",Object(s.a)(2),";padding-top:",Object(s.a)(1.5),";")},Object(a.b)(o.Helmet,null,Object(a.b)("title",null,n.site.siteMetadata.title)),Object(a.b)(i.Link,{to:"/"},Object(a.b)("h3",{css:Object(a.a)("margin-bottom:",Object(s.a)(2),";display:inline-block;font-style:normal;")},n.site.siteMetadata.title)),Object(a.b)(i.Link,{to:"/about/",css:u},"About"),e)}},151:function(t){t.exports={data:{site:{siteMetadata:{title:"My Sandbox"}}}}},152:function(t,e,n){"use strict";n.r(e);n(52);var a=n(0),r=n.n(a),i=n(4),o=n.n(i),s=n(53),u=n(2),c=function(t){var e=t.location,n=u.default.getResourcesForPathnameSync(e.pathname);return r.a.createElement(s.a,Object.assign({location:e,pageResources:n},n.json))};c.propTypes={location:o.a.shape({pathname:o.a.string.isRequired}).isRequired},e.default=c}}]);
//# sourceMappingURL=component---src-pages-index-js-141185cb78ea526e2ca0.js.map