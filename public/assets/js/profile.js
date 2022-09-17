// const token = localStorage.getItem('Authorization');

$(async () => {
  // authorize member
  // let authResult;

  // async function auth_member() {
  //   try {
  //     authResult = await axios({
  //       method: 'GET',
  //       url: '/api/1.0/user/info',
  //       responseType: 'json',
  //       // headers: {
  //       // Authorization: `${localStorage.getItem('Authorization')}`,
  //       // },
  //     });

  //     return authResult;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  // // profile
  // function showProfile() {
  //   const info = authResult.data.response.user;
  //   $('#name').html(`username: ${info.username}`);
  //   $('#email').html(`email: ${info.email}`);
  //   console.log('info', info);
  //   // - if(info.picture === `${SERVER_IP}/public/assets/images/uploads/undefined`) {
  //   // -   const d = $('<div></div>').addClass('img_note').html('no pic')
  //   // -   $('#picture').append(d)
  //   // - }
  //   $('#picture').attr('src', info.picture);
  // }

  // try {
  //   if (!token) {
  //     alert('please sign in or sign up first');
  //     console.log('no token, please sign in or sign up first');
  //     window.location.href = 'login';
  //     return;
  //   }
  //   await auth_member();
  //   showProfile(auth_result);
  // } catch (err) {
  //   console.log(err);
  // }

  // logout
  async function logout() {
    await axios({
      method: 'get',
      url: '/api/1.0/user/logout',
    });
    window.location.href = '/';
  }
  $('#logout_btn').on('click', logout);

  // image upload
  async function submit(e) {
    e.preventDefault();
    const form = $('.image_form')[0];
    const formData = new FormData(form);
    // -formData.append('');
    await axios({
      method: 'POST',
      url: '/api/1.0/user/image',
      data: formData,
      headers: {
        // Authorization: `${localStorage.getItem('Authorization')}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    window.location.href = 'profile';
  }
  $('#submit_image').on('click', submit);
});
