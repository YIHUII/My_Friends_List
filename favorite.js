const BASE_URL = 'https://user-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = JSON.parse(localStorage.getItem('favoriteFriends')) || [] //修改去資料的位置後，要再重新渲染畫面

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

// Index API：把資料放進網頁 影片01:00解釋為了增加式複用性，設定參數命名data 
function renderFriendsList(data) {
  let rawHTML = ''
  data.forEach(item => {
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
            <button type="button" class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
          </div>
        </div>
      </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
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
// 利用findindex找出位置後，用splice刪除畫面，連同 localStorage資料也要刪除
// 錯誤處理:收藏清單中是空的(長度為0) || 不存在收藏清單中(如果變數是falsy) 結束函式
// 補充False 家族: 0、NaN、 ''空字串、false、null、undefined，其餘為truthy
// 如果找不到好友 結束函式
function removeFavorite(id) {
  if (!friends.length || !friends) return
  const friendIndex = friends.findIndex(friend => friend.id === id)
  console.log(friendIndex)
  if (friendIndex === -1) return
  friends.splice(friendIndex, 1)
  localStorage.setItem('favoriteFriends', JSON.stringify(friends)) //畫面刪除後，資料要重新setItem，removeItem會全部清除
  renderFriendsList(friends) //自動渲染新畫面
}

// 設置監聽器：點擊事件 'click' more 按鈕 & X 刪除按鈕
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-friend') || event.target.matches('.card-img-top')) {
    showFriendModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})

renderFriendsList(friends)