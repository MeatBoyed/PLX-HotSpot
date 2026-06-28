$('.form-input').focus(function () {
	$(this).parent().children('.form-label').addClass('label-active');
	$(this).parent().addClass('field-active');
});
$('.form-input').blur(function () {
	if ($(this).val().length == 0) {
		$(this).parent().children('.form-label').removeClass('label-active');
		$(this).parent().removeClass('field-active');
	} else {
		$(this).parent().children('.form-label').addClass('label-active');
		$(this).parent().addClass('field-active');
	}
});

const form = document.signForm;
(eField = form?.querySelector('.email')),
	(eInput = eField?.querySelector('input')),
	(nField = form?.querySelector('.name')),
	(nInput = nField?.querySelector('input'));
(pnField = form?.querySelector('.phone-num')),
	(pnInput = pnField?.querySelector('input')),
	// uField = form?.querySelector(".resume"),
	// uInput = uField?.querySelector("input");

	$('.submit').click(function (e) {
		// e.preventDefault();

		//Select the parent form and submit
		// $(this).parent('form').submit();
		nInput?.value == '' ? nField.classList.add('error') : checkPass();
		eInput?.value == '' ? eField.classList.add('error') : checkEmail();
		pnInput?.value == '' ? pnField.classList.add('error') : checkNum();
		// (uInput?.value == "") ? uField?.classList.add("error") : checkres();

		eInput.onkeyup = () => {
			checkEmail();
		}; //calling checkEmail function on email input keyup
		if (pnInput) {
			pnInput.onkeyup = () => {
				checkNum();
			};
		} //calling checkPassword function on pass input keyup
		nInput.onkeyup = () => {
			checkPass();
		}; //calling checkPassword function on pass input keyup
		// if (uInput) {
		// 	uInput.onkeyup = () => {
		// 		checkres();
		// 	};
		// } //calling checkPassword function on pass input keyup

		function checkEmail() {
			//checkEmail function
			let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/; //pattern for validate email
			if (!eInput?.value.match(pattern)) {
				//if pattern not matched then add error and remove valid class
				eField.classList.add('error');
				let errorTxt = eField.querySelector('.error-txt');
				//if email value is not empty then show please enter valid email else show Email can't be blank
				eInput.value != ''
					? (errorTxt.innerText = 'Enter a valid email address')
					: (errorTxt.innerText = 'Please enter E-mail address');
			} else {
				//if pattern matched then remove error and add valid class
				eField.classList.remove('error');
			}
		}

		function checkPass() {
			//checkPass function
			if (nInput?.value == '') {
				//if pass is empty then add error and remove valid class
				nField.classList.add('error');
			} else {
				//if pass is empty then remove error and add valid class
				nField.classList.remove('error');
			}
		}
		function checkNum() {
			//checkPass function
			if (pnInput?.value == '') {
				//if pass is empty then add error and remove valid class
				pnField.classList.add('error');
			} else {
				//if pass is empty then remove error and add valid class
				pnField?.classList.remove('error');
			}
		}
		// function checkres() {
		//   let resumeParent = document.querySelector(".upload-files-parent");
		//   let resumeRequired = document.querySelector(".upload-complete");
		//   if (resumeRequired === null) { //if pass is empty then add error and remove valid class
		//     resumeParent?.classList.add("error");
		//   } else { //if pass is empty then remove error and add valid class
		//     uField?.classList.remove("error");
		//   }
		// }
	});
