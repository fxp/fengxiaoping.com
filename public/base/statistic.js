var appId = '4cBycY5zIQqNvC03bdDQiF8v-gzGzoHsz';
var appKey = 'pAFSHXpKKvcCr9GF3R5KMfqK';

// 实例化统计分析功能（注意：实例化后，SDK 会自动开始统计 PV、UV、停留页面时长等信息）
var Analytics = AV.analytics({
    appId: appId,
    appKey: appKey,
    version: '0.0.1'
});
