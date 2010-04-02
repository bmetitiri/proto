// vim: ts=4:sw=4
//gcc -lSDL nego.c //Compile settings on Linux
#include "SDL/SDL.h"
#define BLOCK(X,Y,T) r.x = (X) * size + margin; r.y = (Y) * size + margin; \
	r.w = r.h = size - 2 * margin; SDL_FillRect(screen, &r, color(T));
#define BTYPE(N,S)((b.type & N) >> S)&White?White:Black
#define MAX(A,B)(A>B)?A:B
#define MIN(A,B)(A>B)?B:A

enum Type {White=1, Black=2, Dead=4}; //Various block types
typedef struct {
	char x, y;
	unsigned int type;
} Block;

Block b; //Player blockPlayer block
SDL_Event tick, quit;
SDL_Rect r; //Reused rectangle primarily required by SDL_FillRect
SDL_Surface *screen;
SDL_TimerID gameplay; //Timer tested for gamestate
Uint32 light, dark, games, flags, bg = -1, change, counter;
unsigned char **board, reset, height = 20, width = 20, size = 20, margin = 2;
char timer = -128;

//Function to draw background in one of three modes
void background (void){
	switch (bg){
		case 0: //Black and white mode
			SDL_FillRect(screen, NULL, 0x00000000);
			r.x = timer*width*size/127; r.y = 0; 
			r.w = width*size; r.h = height*size;
			SDL_FillRect(screen, &r, 0xffffffff);
			break;
		case -1: //Default, fading to black and white mode
			SDL_FillRect(screen, NULL, MAX(0x77777777 - dark*0x01010101, 0x00000000));
			r.x = timer*width*size/127; r.y = 0; 
			r.w = width*size; r.h = height*size;
			SDL_FillRect(screen, &r, MIN(0x88888888 + light*0x01010101, 0xffffffff));
			break;
		default: //Randomly selected color mode
			if (counter >= change){
				bg = (rand()%0x88+0x33<<16) + (rand()%0x88+0x33<<8) +
						rand()%0x88+0x33;
				counter = 0;
			}
			SDL_FillRect(screen, NULL, bg);
			r.x = timer*width*size/127; r.y = 0; 
			r.w = width*size; r.h = height*size;
			SDL_FillRect(screen, &r, bg + 0x22222222);
			break;
	}
}

//Timer callback to generate tick event for main event loop
Uint32 callback (Uint32 speed, void * param){
	SDL_PushEvent(&tick);
	return (speed);
}

//Function to return color of brick, modifiable for different color schemes
int color (char type){
	switch (type&(White|Black)){
		case White: return 0xffffffff;
		case Black: return 0x00000000;
		default: return 0x00ff0000;
	}
}

//Status print out
void count (void){
	printf ("Game %d: \nWhite Clear: %d\nBlack Clear: %d\nTotal Clear: %d\n",
			++games, dark, light, dark+light);
}

//Draws player block
void block (void){
	BLOCK(b.x, b.y, BTYPE(0xff, 0))
	BLOCK(b.x+1, b.y, BTYPE(0xff00, 8))
	BLOCK(b.x+1, b.y+1, BTYPE(0xff0000, 16))
	BLOCK(b.x, b.y+1, BTYPE(0xff000000, 24))
}

//Draws current game state
void draw (void){
	background();
	block();
	int i, j;
	for (i = 0; i < width; i++)
		for (j = height - 1; j > -1; j--)
			if (board[i][j]){
				BLOCK(i, j, board[i][j]);
			}
	SDL_UpdateRect(screen, 0, 0, 0, 0);
}

//Applies current screen settings
void fullscreen (void){
	screen = SDL_SetVideoMode(width*size, height*size, 32, flags);
	SDL_ShowCursor(flags & SDL_FULLSCREEN?SDL_DISABLE:SDL_ENABLE);
}

//Generates next player piece
void generate (void){
	if (b.x == width/2-1 && b.y == 0){
		SDL_RemoveTimer(gameplay);
		draw();
		gameplay = NULL;
		count();
		light = dark = 0;
		draw();
		reset = 1;
	}
	b.type = rand();
	b.x = width/2-1; b.y = 0;
}

//Attempts to drop player piece, otherwise applies it to board
void haft (void){
	if (board[b.x][b.y+2]||board[b.x+1][b.y+2]||b.y > height-3){
		board[b.x][b.y] = BTYPE(0xff, 0);
		board[b.x+1][b.y] = BTYPE(0xff00, 8);
		board[b.x+1][b.y+1] = BTYPE(0xff0000, 16);
		board[b.x][b.y+1] = BTYPE(0xff000000, 24);
		generate();
	} else
		b.y++;
}

//Primary game logic, including block-formation testing, and gravity
void iterate (){
	background();
	block();
	int i, j, combo=0;
	for (i = 0; i < width; i++)
		for (j = height - 1; j > -1; j--){
			if (board[i][j]){
				if (timer == 0 && board[i][j]&White && board[i][j]&Dead){
					board[i][j] = 0;
					dark++;
					combo++;
				} else if (timer == -128 && board[i][j]&Black && 
						board[i][j]&Dead){
				   	board[i][j] = 0;
					light++;
					combo++;
				} else {
					if (i > 0 && j < height - 1){
						r.x = (i-1)*size+margin; r.y = j*size+margin;
					   	r.w = r.h = 2*(size-margin);
						unsigned char b = board[i][j] & board[i-1][j] &
											board[i][j+1] & board[i-1][j+1];
						if (b & Black || b & White){
							SDL_FillRect(screen, &r, color(b));
							board[i][j] = board[i-1][j] =
								board[i][j+1] = board[i-1][j+1] |= Dead;
						} else
							board[i][j] &= ~Dead;
					}
					if (!board[i][j+1]){
						board[i][j+1] = board[i][j];
						board[i][j] = 0;
						BLOCK(i, j+1, board[i][j+1]);
					} else {
						BLOCK(i, j, board[i][j]);
					}
				}
			}
		}
	counter += combo;
	if (++timer % 10 == 0) haft();
	SDL_UpdateRect(screen, 0, 0, 0, 0);
}

//Handles key press events during gameplay
void keys (SDL_Event event){
	switch (event.key.keysym.sym){
		case SDLK_LEFT:
		case SDLK_h:
		case SDLK_a:
			if (b.x > 0 && !(board[b.x-1][b.y]
					||board[b.x-1][b.y+1]))
				b.x--;
			break;
		case SDLK_DOWN:
		case SDLK_j:
		case SDLK_s:
			haft();
			break;
		case SDLK_UP:
		case SDLK_k:
		case SDLK_w:
			b.type = (b.type & 0xff) << 24 | b.type >> 8;
			break;
		case SDLK_RIGHT:
		case SDLK_l:
		case SDLK_d:
			if (b.x < width-2 && !(board[b.x+2][b.y]
					||board[b.x+2][b.y+1]))
				b.x++;
			break;
	}
}

int main (int argc, char *argv[]){
	unsigned char i;
	srand(time(NULL));
	//Handles various command-line options
	if (argc > 1){
		for (i = 1; i < argc; i++){
			switch (argv[i][1]){
				case 'b':
					i++;
					counter = (change = bg = atoi(argv[i])) + 1;
					break;
				case 'c':
					i++;
					width = MAX(atoi(argv[i]) % 255,4);
					break;
				case 'f':
					flags |= SDL_FULLSCREEN;
					break;
				case 'h':
				case '?':
          printf ("Command line options:\n  -b     Background [#] 0 starts faded, otherwise block count to re-randomize.\n  -c     Column count [4-200].\n  -r     Row count [4-200].\n  -f     Fullscreen [0|1].\n  -s     Size of blocks, including margin [1-200].\n  -m     Size of margin [0-50].\n  -?,-h  Print this help.\n");
					exit(0);
					break;
				case 'm':
					margin = atoi(argv[++i]) % 255;
					break;
				case 'r':
					i++;
					height = MAX(atoi(argv[i]) % 255,4);
					break;
				case 's':
					size = atoi(argv[++i]) % 255;
					break;
			}
			margin = MIN(MAX(0,(size-1)/2), margin);
		}
	}

	//Mallocs dynamically sized board (from command-line options)
	board = (unsigned char **)malloc(width * sizeof(char *));
		for(i = 0; i < width; i++) {
			board[i] = (unsigned char *)malloc(height * sizeof(char));
			memset(board[i], 0, (size_t)(height * sizeof(char)));
		}


	SDL_Event event;
	generate();
	tick.type=SDL_USEREVENT;
	quit.type=SDL_QUIT;
	SDL_Init(SDL_INIT_VIDEO|SDL_INIT_TIMER);
	SDL_EnableKeyRepeat(60, 60);
	fullscreen();
	gameplay = SDL_AddTimer(60, callback, NULL);

	//Game event loop
	while ( SDL_WaitEvent(&event) ) {
		switch (event.type) {
			case SDL_KEYUP:
				//Handles non-gameplay keys
				switch (event.key.keysym.sym){
					case SDLK_SPACE:
						if (gameplay == NULL){
							gameplay = SDL_AddTimer(60, callback, NULL);
							if (reset){
								for(i = 0; i < width; i++)
									memset(board[i], 0, height*sizeof (char));
								reset--;
							}
						} else {
							SDL_RemoveTimer(gameplay);
							gameplay = NULL;
						}
						break;
					case SDLK_RETURN:
						flags ^= SDL_FULLSCREEN;
						fullscreen();
						draw();
						break;
					case SDLK_q:
					case SDLK_ESCAPE:
						SDL_PushEvent(&quit);
						break;
				}
				break;
			case SDL_KEYDOWN:
				if (gameplay)
					keys(event);
				break;
			case SDL_USEREVENT: //Catches custom timer event
				iterate();
				break;
			case SDL_QUIT:
				if (!reset)
					count();
				SDL_Quit();
		}
	}
	return 0;
}
