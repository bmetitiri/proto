set smartindent
set tabstop=4
set shiftwidth=4
"set expandtab
 
filetype indent on
syntax on
 
map <silent> <left>  h
map <silent> <down>  j
map <silent> <up>    k
map <silent> <right> l
 
map j gj
map k gk
map - <C-w>-
map = <C-w>+
map < <C-w><
map > <C-w>>
"map <C-t> :tabe .<cr>
"map <C-e> :tabclose <cr>
 
  
map <silent> <C-d> gT
map <silent> <C-f> gt
map <silent> <C-e> :q<cr>
 
map <silent> <C-h> <C-w>h
map <silent> <C-j> <C-w>j
map <silent> <C-k> <C-w>k
map <silent> <C-l> <C-w>l
 
"map <C-w> <C-w>+<bar>
"map <C-q> <C-w>-<bar>
"map <C-a> <C-w>=<bar>
 
"map <silent> <C-y> <C-w>>
"map <silent> <C-u> <C-w>-
"map <silent> <C-i> <C-w>+
"map <silent> <C-o> <C-w><

map <C-t> :NERDTreeToggle<cr>

:highlight OverColLimit term=bold cterm=bold
:au BufRead,BufNewFile * match OverColLimit '\%>80v.\+'
 
"highlight OverLength ctermbg=darkred ctermfg=white
"match OverLength /\%81v.*/
 
let NERDTreeIgnore=['\.vim$', '\.pyc$']
 
 
 
:highlight OverColLimit term=bold cterm=bold

:colorscheme desert
