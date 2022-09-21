// $(async () => {
//   // logout
//   async function logout() {
//     await axios({
//       method: 'get',
//       url: '/api/1.0/user/logout',
//     });
//     window.location.href = '/home?locale=en-US';
//   }
//   // TODO:
//   $('#logout_btn').on('click', logout);

//   // image upload
//   async function submit(e) {
//     e.preventDefault();
//     const form = $('.image_form')[0];
//     const formData = new FormData(form);
//     // -formData.append('');
//     await axios({
//       method: 'POST',
//       url: '/api/1.0/user/image',
//       data: formData,
//       headers: {
//         // Authorization: `${localStorage.getItem('Authorization')}`,
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     // TODO:
//     window.location.href = 'profile?locale=en-US';
//   }
//   $('#submit_image').on('click', submit);
// });
