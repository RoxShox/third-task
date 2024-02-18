// function serverAuth() {
// 	const inputServer = document.querySelector(".form__input-server")
// 	const inputLogin = document.querySelector(".form__input-login")
// 	const inputPassword = document.querySelector(".form__input-password")
// 	const submitBtn = document.querySelector(".btn__submit")
// 	submitBtn.addEventListener("click", submitForm)
// 	function submitForm(e) {
// 		e.preventDefault()
// 		const server = inputServer.value
// 		const uri = `sip:${inputLogin.value}@${inputServer.value}`
// 		const password = inputPassword.value
// 		callUser(server, password, uri)
// 		inputServer.value = ""
// 		inputLogin.value = ""
// 		inputPassword.value = ""
// 	}
// }
// serverAuth()

function callUser(server, password, uri) {
	const callBtn = document.getElementById("call")
	const hangupBtn = document.getElementById("hangup")
	const callStatus = document.querySelector(".call__status")
	const historyCallWrap = document.querySelector(".call__history-wrap")
	const inputNum = document.querySelector("#num")

	let timer = document.getElementById("timer")

	let seconds = 0
	let minutes = 0
	let hours = 0
	let interval

	historyCallWrap.addEventListener("click", callHistoryNum)

	function updateTime() {
		seconds++
		if (seconds === 60) {
			minutes++
			seconds = 0
		}
		if (minutes === 60) {
			hours++
			minutes = 0
		}
		timer.textContent = `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
	}

	// JsSIP.debug.enable("JsSIP:*")
	// let socket = new JsSIP.WebSocketInterface(`wss://${server}`)
	// let configuration = {
	// 	sockets: [socket],
	// 	uri,
	// 	password: password,
	// }
	let socket = new JsSIP.WebSocketInterface(`wss://voip.uiscom.ru`)
	let configuration = {
		sockets: [socket],
		uri: "sip:0332154@voip.uiscom.ru",
		password: "_P7XYUBDwz",
	}

	let remoteAudio = new window.Audio()
	remoteAudio.autoplay = true

	let ua = new JsSIP.UA(configuration)

	// События регистрации клиента
	ua.on("connected", function (e) {
		console.log("connect")
	})
	ua.on("disconnected", function (e) {
		console.log("disconnet")
	})

	ua.on("registered", function (e) {
		console.log("register")
	})
	ua.on("unregistered", function (e) {})
	ua.on("registrationFailed", function (e) {})

	// Запускаем
	ua.start()

	// Обработка событии исх. звонка
	let eventHandlers = {
		progress: function (e) {
			console.log("ожидание")
			callStatus.textContent = "Статус звонка: Ожидание ответа"
			session.connection.ontrack = function (e) {
				console.log(e)
				remoteAudio.srcObject = e.streams[0]
			}
		},
		failed: function (e) {
			callEnded()
		},
		ended: function (e) {
			callEnded()
		},
		confirmed: function (e) {
			interval = setInterval(updateTime, 1000)
			timer.classList.remove("hide")
			timer.classList.add("show")
			callStatus.textContent = "Статус звонка: В процессе"
			console.log("звонок принят")
		},
	}

	let options = {
		eventHandlers: eventHandlers,
		mediaConstraints: { audio: true, video: false },
	}

	function createHistoryNum(number) {
		const div = document.createElement("div")
		const img = document.createElement("img")
		img.src = "../img/call.svg"
		div.classList.add("call__history-item")
		div.textContent = number
		div.append(img)
		historyCallWrap.prepend(div)
	}

	function callHistoryNum(e) {
		if (e.target.closest(".call__history-item")) {
			const historyNumValue = e.target.textContent
			callNumber(e, historyNumValue)
		}
	}

	// Очистка всей информации после завершения звонка
	function callEnded() {
		callStatus.textContent = "Статус звонка: Звонок завершен"
		clearInterval(interval)
		setTimeout(() => {
			clearInterval(interval)
			seconds = 0
			minutes = 0
			hours = 0
			timer.textContent = "00:00:00"
			timer.classList.remove("show")
			timer.classList.add("hide")
			$(".call__user")[0].innerText = ""
			callStatus.textContent = ""
		}, 2000)
		$("#call").css({ display: "flex" })
		$("#hangup").css({ display: "none" })
	}
	// Кнопка для звонка

	callBtn.addEventListener("click", callNumber)

	function callNumber(e, value = "") {
		if (value == "" && inputNum.value == "") {
			return
		}
		const number = inputNum.value === "" ? value : inputNum.value
		createHistoryNum(number)
		session = ua.call(number, options)
		$(".call__user")[0].innerText = `Вы звоните по номеру:${number}`
		$("#call").css({ display: "none" })
		$("#hangup").css({ display: "flex" })
		inputNum.value = ""
	}
	// $("#call").click(function (e) {
	// 	createHistoryNum($("#num").val())
	// 	session = ua.call($("#num").val(), options)

	// 	$("#call").css({ display: "none" })
	// 	$("#hangup").css({ display: "flex" })
	// 	$("#num").val("")
	// })

	// Кнопка для отбоя звонка
	$("#hangup").click(function () {
		if (session) {
			session.terminate()
		}
		$(".call__user").val(``)
		$("#call").css({ display: "flex" })
		$("#hangup").css({ display: "none" })
	})
}

callUser()
