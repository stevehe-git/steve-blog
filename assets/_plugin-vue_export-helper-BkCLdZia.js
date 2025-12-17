const s="blog-articles",i=[{id:1,title:"Md2Design：更简单、更美观的图文卡片生成器",description:"轻量卡片设计工具，简化信息展示流程，适合日常分享与快速传递。",content:`# 背景
从 Markdown 到视觉卡片的一键转换，主打「无需设计基础」。

## 功能亮点
- 多模板与主题色，一键成图
- 自动排版与网格，适合社媒/总结/海报
- 导出高清图，支持多尺寸

## Roadmap
- 自定义模板与品牌色
- AI 文案润色 / 翻译
- 一键发布到社交平台`,categoryKey:"dit",tag:"DiT",badge:"Beta",date:"2025-12-12",platform:"Wechat",cover:"linear-gradient(135deg, #0a0f26 0%, #0c1a4d 35%, #032c5f 65%, #0c1a4d 100%)"},{id:2,title:"个人网站已上线：感谢Gemini3，这是第一版个人网站",description:"第一版上线，用以记录思考与灵感，后续将持续完善功能与体验。",content:`# 上线笔记
第一版聚焦信息架构与阅读体验：导航、文章列表与深浅色。

## 当前能力
- 文章列表与详情
- 多语言切换
- 深浅色切换

## 下一步
- 作品集模块
- 评论与订阅
- 开发日志与设计迭代记录`,categoryKey:"dit",tag:"DiT",badge:"1.0",date:"2025-12-11",platform:"Wechat",cover:"linear-gradient(135deg, #0d121f 0%, #132642 50%, #243c5a 100%)"},{id:3,title:"暗叽be叽：杂记与灵感收集",description:"关于创作与生活的片段记录，聚合了近期的灵感、思考与待办。",content:`# 写在前面
这是一份松散的创作备忘录，记录碎片化灵感与旅行思考。

## 最近在写
- 灵感收集：零散想法与素材
- 旅行路书：路线、拍照点与踩坑
- 创意试验：想尝试的小项目

## 计划
- 按主题拆分系列
- 增加配图与地图
- 更细的标签方便检索`,categoryKey:"note",tag:"杂记",date:"2025-11-28",platform:"Wechat",cover:"linear-gradient(135deg, #101820 0%, #1f1f2f 50%, #2c2c3b 100%)"}],d=()=>{try{const t=localStorage.getItem(s);if(t){const e=JSON.parse(t);if(Array.isArray(e)&&e.length>0)return e}}catch(t){console.error("Failed to load articles from storage:",t)}return n(i),i},n=t=>{try{localStorage.setItem(s,JSON.stringify(t))}catch(e){console.error("Failed to save articles to storage:",e)}},a=d(),l=t=>a.find(e=>e.id===t),g=t=>{const r={id:a.length>0?Math.max(...a.map(o=>o.id))+1:1,...t};return a.push(r),n(a),r},f=(t,e)=>{const r=a.findIndex(c=>c.id===t);if(r===-1)throw new Error(`Article with id ${t} not found`);const o={...a[r],...e,id:t};return a[r]=o,n(a),o},p=(t,e)=>{const r=t.__vccOpts||t;for(const[o,c]of e)r[o]=c;return r};export{p as _,a,g as c,l as g,f as u};
