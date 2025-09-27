function isDiscourseSite()
{
    return document.querySelector('meta[name="generator"]')?.content?.includes('Discourse') ||
           document.querySelector('.d-header') !== null || document.querySelector('#main-outlet') !== null;
}

function createNoteIcon(username, hasNote = false)
{
    const icon = document.createElement('span');
    icon.className = 'discourse-note-icon';

    if (hasNote)
    {
        icon.innerHTML = '🔖'; 
        icon.title = `View note for ${username}`;
        icon.style.color = '#007cba';
        icon.style.opacity = '1';
    }
    else    
    {
        icon.innerHTML = '📝'; 
        icon.title = `Add note for ${username}`;
        icon.style.opacity = '0.6';
    }

    icon.style.cursor = 'pointer';
    icon.style.marginLeft = '5px';

    icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showNoteDialog(username);
    });

    return icon;
}

function showNoteDialog(username)
{
    const existingDialog = document.getElementById('discourse-note-dialog');

    if (existingDialog) existingDialog.remove();

    const dialog = document.createElement('div');
    dialog.id = 'discourse-note-dialog';
    dialog.innerHTML = `
    <div class="note-dialog-content">
      <div class="note-dialog-header">
        <h3>📝 Note for ${username}</h3>
        <button class="note-dialog-close">×</button>
      </div>
      <div class="note-dialog-body">
        <textarea id="note-textarea" placeholder="Enter your note about ${username}..." rows="4"></textarea>
        <div class="note-dialog-actions">
          <button id="save-note">💾 Save</button>
          <button id="delete-note">🗑️ Delete</button>
          <button id="cancel-note">❌ Cancel</button>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(dialog);

    chrome.storage.local.get([`note_${username}`], (result) => {
        const textarea = document.getElementById('note-textarea');
        if (result[`note_${username}`])
        {
            textarea.value = result[`note_${username}`];
            document.querySelector('.note-dialog-header h3').innerHTML = `🔖 Note for ${username}`;
        }
        textarea.focus();
    });

    document.querySelector('.note-dialog-close').addEventListener('click', () => {
        dialog.remove();
    });

    document.getElementById('cancel-note').addEventListener('click', () => {
        dialog.remove();
    });

    document.getElementById('save-note').addEventListener('click', () => {
        const note = document.getElementById('note-textarea').value.trim();
        if (note)
        {
            chrome.storage.local.set({ [`note_${username}`]: note }, () => {
                updateUserNoteIndicators(username);
                dialog.remove();
            });
        }
        else
        {
            chrome.storage.local.remove([`note_${username}`], () => {
                updateUserNoteIndicators(username);
                dialog.remove();
            });
        }
    });

    document.getElementById('delete-note').addEventListener('click', () => {
        if (confirm(`Delete note for ${username}?`))
        {
            chrome.storage.local.remove([`note_${username}`], () => {
                updateUserNoteIndicators(username);
                dialog.remove();
            });
        }
    });
}

function updateUserNoteIndicators(username = null)
{
    if (username)
    {
        chrome.storage.local.get([`note_${username}`], (result) => {
            const hasNote = !!result[`note_${username}`];
            updateUserElements(username, hasNote);
        });
    }
    else // Update all users
    {
        
        const userElements = document.querySelectorAll('[data-user-card]');
        userElements.forEach(element => {
            const user = element.getAttribute('data-user-card');
            if (user) {
                chrome.storage.local.get([`note_${user}`], (result) => {
                    const hasNote = !!result[`note_${user}`];
                    updateUserElements(user, hasNote);
                });
            }
        });
    }
}

function updateUserElements(username, hasNote)
{
    const userElements = document.querySelectorAll(`[data-user-card="${username}"]`);
    userElements.forEach(element => {
        const existingIcon = element.querySelector('.discourse-note-icon');

        if (existingIcon) existingIcon.remove();

        const icon = createNoteIcon(username, hasNote);
        element.appendChild(icon);
    });
}

function init()
{
    if (!isDiscourseSite()) return;

    addNoteIcons();

    // Watch for dynamically loaded content
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.querySelector('[data-user-card]') || node.matches('[data-user-card]')) {
                        shouldUpdate = true;
                    }
                }
            });
        });

        if (shouldUpdate) setTimeout(addNoteIcons, 100);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function addNoteIcons()
{
    const userElements = document.querySelectorAll('[data-user-card]');
    userElements.forEach(element => {
        if (element.querySelector('.discourse-note-icon')) return;

        const username = element.getAttribute('data-user-card');
        if (username)
        {
            chrome.storage.local.get([`note_${username}`], (result) => {
                const hasNote = !!result[`note_${username}`];
                const icon = createNoteIcon(username, hasNote);
                element.appendChild(icon);
            });
        }
    });
}

if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', init);
else
    init();
