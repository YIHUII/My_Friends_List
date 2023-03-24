const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = []
let filterFriends = []
const FRIENDS_PER_PAGE = 12

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// Index API：把資料放進網頁 影片01:00解釋為了增加式複用性，參數命名data 
function renderFriendsList(data) {
  let rawHTML = ''
  data.forEach(item => {
    console.log(item)
    rawHTML += `
    <div class="col-sm-3">
      <div class="m-2" >
        <div class="card">
          <img src="${item.avatar}" class="card-img-top"
            alt="friend avatar" data-bs-toggle="modal"
                data-bs-target="#friend-modal" data-id=${item.id}>
          <div class="card-body"data-bs-target="#friend-modal" data-id=${item.id}>
            <h5 class="card-title" align="center">${item.name + ' ' + item.surname}</h5>
          </div>
          <div class="card-footer" align="center">
            <button type="button" class="btn btn-primary btn-show-friend" data-bs-toggle="modal"
                data-bs-target="#friend-modal" data-id=${item.id}>More</button>
            <button type="button" class="btn btn-dark btn-add-favorite" data-id=${item.id}>+</button>
          </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}
// 將資料分頁: 抓index位置後，物件陣列切割slice
// API串接資料，只顯示第一頁 page1
// 搜尋功能因素，多設定條件
function getFriendsByPage(page) {
  // 三元運算子 條件 ? 值1 : 值2
  const data = filterFriends.length ? filterFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE //0/12/24
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}
// 產生分頁頁碼
// API串接資料，渲染
// 要設置點擊分頁頁碼的監聽器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showFriendModal(id) {
  const friendModalTitle = document.querySelector('#friend-modal-title')
  const friendModalBody = document.querySelector('#friend-modal-body')
  const friendModalImage = document.querySelector('#friend-modal-image')
  const friendModalInfo = document.querySelector('#friend-modal-info')

  // 避免出現殘影(會先出現上一個資料)，先將modal清空
  friendModalTitle.textContent = ''
  friendModalImage.src = ''
  friendModalInfo.innerHTML = ''

  axios
    .get(INDEX_URL + id)
    .then(response => {
      const user = response.data
      //console.log(user)
      friendModalTitle.textContent = user.name + ' ' + user.surname
      friendModalImage.src = user.avatar
      friendModalInfo.innerHTML = `
      <p>email: ${user.email}</p>
      <p>gender: ${user.gender}</p>
      <p>age: ${user.age}</p>
      <p>region: ${user.region}</p>
      <p>birthday: ${user.birthday}</p>
      `
    })

}
// 加入收藏清單 : 將資料存入 local storage
// list = 從 localStorage 中取出 key是favoriteFriends的值，如果沒有東西就給 一個空陣列
// friend = 如果find從全部的friends找出 符合的參數friend.id === addToFavorite存入的參數id 函式結束
// 將找出的 friend 新增push 至 list 當中
// 設定localStorage存入的 key 和 value ，讓 list 能依據key取出 相對的值
// 最後 到 favorite.js 將 原本從API取資料 改為 從localStorage取資料
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || [] //localStorage原本為 字串 轉為 js物件
  // function isFriendIdMatched(friend) {
  //   return friend.id === id
  // }
  // const friend = friends.find(isFriendIdMatched)
  const friend = friends.find(friend => friend.id === id)
  //console.log(friend)
  if (list.some(friend => friend.id === id)) {
    return alert('此好友已在收藏清單中囉！')
  }
  list.push(friend) //要轉為 JS物件後 才能有作用
  //console.log(list)
  localStorage.setItem('favoriteFriends', JSON.stringify(list)) //再將 js物件 轉回為 字串
}

// 設置監聽器: 點擊事件'click' : more 按鈕 & favorite 按鈕
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-friend') || event.target.matches('.card-img-top')) {
    showFriendModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 設置監聽器: 點擊事件'click' : 分頁 按鈕 
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName != 'A') return
  const page = Number(event.target.dataset.page)
  //console.log(event.target.dataset.page) //renderPaginator(amount) <li>有設定data-* 的屬性
  renderFriendsList(getFriendsByPage(page))
})

// 設置監聽器: 提交事件'submit'，search 按鈕
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  //console.log(event)
  const keyword = searchInput.value.trim().toLowerCase()
  //console.log(searchInput.value)
  if (!keyword.length) {
    return alert('請輸入有效文字')
  }

  //篩選 
  filterFriends = friends.filter((user) =>
    user.name.toLowerCase().includes(keyword) ||
    user.surname.toLowerCase().includes(keyword))

  console.log(filterFriends)

  if (filterFriends.length === 0) {
    return alert('找不到相關關鍵字 : ' + keyword)
  }
  //renderFriendsList(filterFriends)
  renderPaginator(filterFriends.length)
  renderFriendsList(getFriendsByPage(1))
})

axios
  .get(INDEX_URL)
  .then(response => {
    friends.push(...response.data.results)
    //console.log(friends)
    //console.log(friends.length)
    renderPaginator(friends.length) //分頁頁碼
    renderFriendsList(getFriendsByPage(1))//分頁功能:將原本全部資料，切割為12筆一頁
  })
  .catch(err => console.log(err))

