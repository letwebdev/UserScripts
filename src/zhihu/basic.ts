export const zhihu = {
  validFollowUrl: new RegExp("^https://www.zhihu.com/follow*"),
  validQuestionUrl: new RegExp("^https://www.zhihu.com/question(?!.*/log$).*"),
  validPeoPleUrl: new RegExp("^https://www.zhihu.com/people/*"),
  validArticleUrl: new RegExp("^https://zhuanlan.zhihu.com/p/*"),
  validConsultUrl: new RegExp("^https://www.zhihu.com/consult/people/*"),
  get inArticlePage() {
    return this.validArticleUrl.test(window.location.href)
  },
} as const
