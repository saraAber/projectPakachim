import React from 'react';
import addNotification from 'react-push-notification';
//חלון אזהרה
export const WarningNotification = () => {
    addNotification({
        title: 'אזהרה',
        message: 'המערכת זיהתה חריגה מהמהירות המותרת בכביש זה.',
        duration: 4000,
        theme: 'darkblue',
        native: true 
    });
}
export const UpdateNotification = () => {
    addNotification({
        title: 'עידכון',
        message: 'אם אינך הנהג,לטובתך עדכן זאת באפליקציה',
        duration: 4000,
        theme: 'darkblue',
        native: true 
    });
}
///
        // const buttonClick = () => {
    //     addNotification({
    //         title: 'Warning',
    //         subtitle: 'This is a subtitle',
    //         message: 'המערכת זיהתה חריגה מהמהירות המותרת בכביש זה.',
    //         duration: 10000,
    //         theme: 'darkblue',
    //         native: true // when using native, your OS will handle theming.
    //     });
    // };

//     return (
//       <div className="page">
//           <button onClick={buttonClick} className="button">
//            Hello world.
//           </button>
//       </div>
//     );
//   }
// export default Page