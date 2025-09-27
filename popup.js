function loadNotes()
{
  chrome.storage.local.get(null, (items) => {
    const notesList = document.getElementById('notes-list');
    const statsDisplay = document.getElementById('stats-display');
    const notes = [];

    for (const [key, value] of Object.entries(items)) {
      if (key.startsWith('note_'))
      {
        const username = key.substring(5);
        notes.push({ username, note: value });
      }
    }

    statsDisplay.textContent = `Total notes: ${notes.length}`;

    if (notes.length === 0)
    {
      notesList.innerHTML = `
        <div class="no-notes">
          📝➡️🔖<br>
          No notes yet!<br>
          Visit a Discourse forum and click the memo icon (📝) next to usernames to start adding notes.
        </div>
      `;
      return;
    }

    notes.sort((a, b) => a.username.localeCompare(b.username));

    notesList.innerHTML = notes.map(({ username, note }) => {
      const isLongNote = note.length > 100;
      const noteId = `note-${username.replace(/[^a-zA-Z0-9]/g, '-')}`;

      return `
        <div class="note-item" data-username="${escapeHtml(username)}">
          <div class="note-header">
            <div class="note-username">
              <span>🔖</span>
              <span>${escapeHtml(username)}</span>
            </div>
            <div class="note-actions">
              <button class="note-btn edit-btn" data-action="edit" data-username="${escapeHtml(username)}">
                ✏️ Edit
              </button>
              <button class="note-btn delete-btn" data-action="delete" data-username="${escapeHtml(username)}">
                🗑️ Delete
              </button>
            </div>
          </div>
          <div class="note-text ${isLongNote ? 'collapsed' : ''}" id="${noteId}">
${escapeHtml(note)}
          </div>
          ${isLongNote ? `<button class="expand-btn" data-action="expand" data-target="${noteId}">Show more...</button>` : ''}
        </div>
      `;
    }).join('');

    addEventListeners();
  });
}

function addEventListeners()
{
  document.querySelectorAll('.note-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      const username = e.target.getAttribute('data-username');

      if (action === 'edit')
      {
        editNote(username);
      }
      else if (action === 'delete')
      {
        deleteNote(username);
      }
    });
  });

  document.querySelectorAll('.expand-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const targetId = e.target.getAttribute('data-target');
      toggleExpand(targetId, e.target);
    });
  });
}

function editNote(username)
{
  const noteItem = document.querySelector(`[data-username="${username}"]`);
  if (!noteItem) return;

  chrome.storage.local.get([`note_${username}`], (result) => {
    const currentNote = result[`note_${username}`] || '';

    const editForm = document.createElement('div');
    editForm.className = 'edit-form';
    editForm.innerHTML = `
      <textarea class="edit-textarea" placeholder="Edit your note about ${escapeHtml(username)}...">${escapeHtml(currentNote)}</textarea>
      <div class="edit-form-actions">
        <button class="save-edit-btn">💾 Save</button>
        <button class="cancel-edit-btn">❌ Cancel</button>
      </div>
    `;

    const noteTextEl = noteItem.querySelector('.note-text');
    const expandBtn = noteItem.querySelector('.expand-btn');

    const originalContent = noteTextEl.outerHTML;
    const originalExpandBtn = expandBtn ? expandBtn.outerHTML : '';

    noteTextEl.replaceWith(editForm);
    if (expandBtn) expandBtn.remove();

    const textarea = editForm.querySelector('.edit-textarea');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    editForm.querySelector('.save-edit-btn').addEventListener('click', () => {
      const newNote = textarea.value.trim();
      if (newNote) {
        chrome.storage.local.set({ [`note_${username}`]: newNote }, () => {
          loadNotes(); 

          try
          {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0])
              {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: 'updateUserNote',
                  username: username,
                  hasNote: true
                }).catch(() => {
                  // Ignore errors if content script not loaded
                });
              }
            });
          }
          catch (e)
          {}
        });
      } 
      else
      {
        chrome.storage.local.remove([`note_${username}`], () => {
          loadNotes();
        });
      }
    });

    // Handle cancel
    editForm.querySelector('.cancel-edit-btn').addEventListener('click', () => {
      loadNotes();
    });
  });
}

function deleteNote(username) {
  if (confirm(`Delete note for ${username}?\n\nThis action cannot be undone.`)) {
    chrome.storage.local.remove([`note_${username}`], () => {
      loadNotes(); 

      try
      {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateUserNote',
              username: username,
              hasNote: false
            }).catch(() => {
              // Ignore errors if content script not loaded
            });
          }
        });
      }
      catch (e)
      {}
    });
  }
}

function toggleExpand(noteId, button)
{
  const noteEl = document.getElementById(noteId);
  if (!noteEl || !button) return;

  if (noteEl.classList.contains('collapsed'))
  {
    noteEl.classList.remove('collapsed');
    button.textContent = 'Show less...';
  }
  else
  {
    noteEl.classList.add('collapsed');
    button.textContent = 'Show more...';
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text)
{
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.getElementById('clear-all').addEventListener('click', () => {
  if (confirm('Are you sure you want to delete all notes?\n\nThis action cannot be undone and will permanently remove all your saved notes.'))
  {
    chrome.storage.local.clear(() => {
      loadNotes();
    });
  }
});

loadNotes();
