export function supplementHeader() {
  const header = document.querySelector(".AppHeader-userInfo") as HTMLElement
  const favorites = document.querySelector(".GlobalSideBar-starItem") as HTMLLIElement
  const followingQuestions = document.querySelector(
    ".GlobalSideBar-questionListItem"
  ) as HTMLLIElement
  const ul = document.createElement("ul")
  ul.style.display = "flex"
  ul.append(favorites, followingQuestions)
  header.append(ul)
}
