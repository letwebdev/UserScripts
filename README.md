# Scripts for TamperMonkey

## Commands

```sh
# Build all scripts under `src/`
npm run build
```

```sh
# Build single script
npm run compileIntoSingleFile path/to/script
```

## User scripts

### Zhihu tweaker

- 移除生成的关键词搜索链接蓝字高亮
- 移除重定向
- 回答显示创建时间和最后修改时间
- 首页-关注页面 `header` 显示 "我的收藏" 和 "我关注的问题"
- 问题页面 显示 "查看问题日志" 按钮, 提问者, 问题创建时间和最后修改时间
- 咨询页面 显示 "打开对话页面" 按钮

### PlaybackRate Controller

目前仅支持B站

- 按`s`调整基础播放速度为1或2(默认为1)
- 按`1-9`调整播放速度为相应倍速,再按一次恢复为基础播放速度
- 按住`a`调整为4倍播放速度, 松开恢复为基础播放速度
