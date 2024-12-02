const dropdown = document.getElementById("dropdown");
const dropdownButton = document.getElementById("dropdown-button");
const dropdownOptions = document.getElementById("dropdown-options");
const queryInput = document.getElementById("query");
const autocomplete = document.getElementById("autocomplete");

// 저장된 검색 엔진 불러오기 또는 기본값 설정
let selectedEngine =
  localStorage.getItem("selectedEngine") || "https://www.google.com/search?q=";
dropdownButton.textContent =
  localStorage.getItem("selectedEngineName") || "Google";

// 검색 엔진 선택
dropdownButton.addEventListener("click", (e) => {
  e.stopPropagation(); // 이벤트 버블링 중지
  dropdown.classList.toggle("active");
});

dropdownOptions.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    selectedEngine = e.target.getAttribute("data-url");
    dropdownButton.textContent = e.target.textContent;
    dropdown.classList.remove("active");
    // 선택한 검색 엔진 저장
    localStorage.setItem("selectedEngine", selectedEngine);
    localStorage.setItem("selectedEngineName", dropdownButton.textContent);
  }
});

// 드롭다운 외부 클릭 시 닫기
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});

// 검색 실행
function performSearch() {
  const query = queryInput.value.trim();
  if (!query) {
    alert("검색어를 입력하세요!");
    return;
  }
  saveSearchHistory(query);
  const url = selectedEngine + encodeURIComponent(query);
  window.open(url, "_blank");
}

// 검색 기록 저장
function saveSearchHistory(query) {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 10) history.pop();
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }
}

// 검색 기록 삭제
function deleteHistoryItem(item) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  history = history.filter((historyItem) => historyItem !== item);
  localStorage.setItem("searchHistory", JSON.stringify(history));
  updateAutocomplete();
}

// 자동완성 업데이트
function updateAutocomplete() {
  const value = queryInput.value.trim().toLowerCase();
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  autocomplete.innerHTML = "";

  let matches = [];

  if (value) {
    matches = history.filter((item) => item.toLowerCase().includes(value));
  } else {
    matches = history.slice(0, 8); // 최근 검색한 8개 항목
  }

  if (matches.length > 0) {
    matches.forEach((match) => {
      const suggestionDiv = document.createElement("div");

      const suggestionText = document.createElement("span");
      suggestionText.textContent = match;

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteHistoryItem(match);
      });

      // 삭제 아이콘 SVG
      deleteButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;

      suggestionDiv.appendChild(suggestionText);
      suggestionDiv.appendChild(deleteButton);

      // 전체 항목에 클릭 이벤트 추가
      suggestionDiv.addEventListener("mousedown", (e) => {
        // 삭제 버튼을 클릭한 경우에는 무시
        if (e.target.closest(".delete-button")) return;
        e.preventDefault();
        queryInput.value = match;
        autocomplete.innerHTML = "";
        updateAutocompleteBorder();
      });

      autocomplete.appendChild(suggestionDiv);
    });
  }

  updateAutocompleteBorder();
}

// 자동완성의 border 동적 업데이트
function updateAutocompleteBorder() {
  if (autocomplete.innerHTML.trim() === "") {
    autocomplete.style.border = "none";
  } else {
    autocomplete.style.border = "1px solid #ccc";
  }
}

// 입력 필드에 포커스가 가면 자동완성 표시
queryInput.addEventListener("focus", updateAutocomplete);

// 입력 이벤트로 자동완성 업데이트
queryInput.addEventListener("input", updateAutocomplete);

// 입력 필드가 비활성화되면 자동완성 숨기기
queryInput.addEventListener("blur", (e) => {
  // 클릭된 요소가 자동완성 내부인지 확인
  setTimeout(() => {
    if (
      !autocomplete.contains(document.activeElement) &&
      document.activeElement !== queryInput
    ) {
      autocomplete.innerHTML = "";
      updateAutocompleteBorder();
    }
  }, 100);
});

// 자동완성 항목 클릭 시 자동완성 창 유지
autocomplete.addEventListener("mousedown", (e) => {
  e.preventDefault(); // 포커스가 다른 곳으로 이동하는 것을 방지
});

// Enter 키 누르면 검색 실행
queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // 기본 동작 막기
    performSearch();
    autocomplete.innerHTML = "";
    updateAutocompleteBorder();
  }
});
