/**
 * Function to lock screen when performing ajex calls
 * @param str display the information when screen being locked
 */
function lockScreenAndWait(str) 
{ 
   var lock = document.getElementById('lockPane'); 
   if (lock) 
      lock.className = 'LockOn'; 

   lock.innerHTML = str; 
}

/**
 * Function to unlock screen when finishing ajex calls
 */
function unlockScreen() 
{ 
   var lock = document.getElementById('lockPane'); 
   if (lock) 
      lock.className = 'LockOff';  
}