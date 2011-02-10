package ne.go;

import android.app.Activity;
import android.content.Context;
import android.graphics.*; //Canvas, Color, Paint
import android.hardware.*; //Sensor, SensorListener, SensorManager;
import android.os.Bundle;
import android.view.View;
import android.view.GestureDetector;
import android.view.GestureDetector.OnGestureListener;
import android.view.MotionEvent;

import java.util.Random;

//Primary class for the Application
public class Nego extends Activity {
	
	//Byte for timer for wrapping, enums for various block types
	byte timer = 0, black_bit = 1, white_bit = 2, exist_bit = 4, clear_bit=8;
	byte [][] board;
	int xoffset, yoffset, dark, light, width, height,
		grid = 20, margin = 2, block = grid - margin * 2;
	NegoMain main;
	NegoView view;
	Player player;
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		view = new NegoView(this);
		setContentView(view);
	}
	//Main view, also contains logic iterator to avoid reiterating
	class NegoView extends View implements OnGestureListener {
		Paint white = new Paint(), black = new Paint(), fore = new Paint();
		GestureDetector gestures;
		public NegoView(Context context){
			super(context);
			//Starts listening for finger swipes
			gestures = new GestureDetector(this);
			white.setColor(Color.WHITE);
			black.setColor(Color.BLACK);
		}
		//Gets the width and height of the application
		@Override protected void onSizeChanged(int w, int h, int exw, int exh){
			super.onSizeChanged(w, h, exw, exh);
			if (exw == 0 && exh == 0){
				board = new byte[w / grid][h / grid];
				xoffset = w % grid / 2;
				yoffset = h % grid / 2;
				width = w; height = h;
				main = new NegoMain();
				new Thread(main).start();
			}
		}
		//Draws, marks complete squares and causes blocks to fall
		@Override protected void onDraw(Canvas canvas) {
			super.onDraw(canvas);
			//Renders background based on the timer and game progress
			if (dark <= 119)
				this.setBackgroundColor(0xff777777 - dark * 0x010101);
			if (light <= 119)
				fore.setColor(0xff888888 + light * 0x010101);
			int left = (timer>0)?timer*width/127:0;
			int right = (timer>0)?width:(127+timer)*width/127;
			canvas.drawRect(left, 0, right, height, fore);

			byte b;
			for (int x = 0; x < board.length; x++)
				for (int y = board[0].length - 1; y >= 0; y--) {
					b = board[x][y];
					if (b != 0){
						//Removes completed blocks in squares on timer
						if (timer == -128 && ((b & (clear_bit|black_bit)) == 
										(clear_bit|black_bit))){
							board[x][y] = 0;
							light++;
						} else if (timer == 0 && ((b & (clear_bit|white_bit)) ==
										(clear_bit|white_bit))){
							board[x][y] = 0;
							dark++;
						} else {
							//Checks for complete squares
							if ((x > 0 && y < board[0].length - 1) &&
									(((b & board[x][y+1] & board[x-1][y+1] 
									& board[x-1][y]) & (white_bit|black_bit|
									exist_bit)) > exist_bit)){
								block(canvas, x-1, y, b, block*2+margin*2);
								//Set block type for clearing on timer
								board[x][y] |= clear_bit;
								board[x][y+1] |= clear_bit;
								board[x-1][y+1] |= clear_bit;
								board[x-1][y] |= clear_bit;
							} else 
								//Remove clear flag
								board[x][y] &= ~clear_bit;
							//Drop blocks if possible
							if (y < board[0].length - 1 && board[x][y+1] == 0){
								board[x][y+1] = b;
								board[x][y] = 0;
							}
							block(canvas, x, y, b);
						}
					}
				}
			for (Block bb : player.blocks)
				block(canvas, bb.x, bb.y, bb.type);

			//Draw game progress
			canvas.drawText(""+dark, 20f, 20f, white);
			canvas.drawText(""+light, width-40f, 20f, black);
		}
		//Draws the singular blocks, defaults size to block
		void block(Canvas canvas, int x, int y, byte type) {
			block(canvas, x, y, type, block);
		}
		//Draws a rectangle given board coordinates
		void block(Canvas canvas, int x, int y, byte type, int size) {
			x = x * grid + margin + xoffset;
			y = y * grid + margin + yoffset;
			canvas.drawRect(x, y, x + size, y + size, color(type));
		}
		//Processes block type to return a Paint
		Paint color(byte type){
			if ((type & black_bit) == 0)
				return white;
			else
				return black;
		}
		//Following block allows for touch interaction
		@Override public boolean onTouchEvent(MotionEvent me){
			return gestures.onTouchEvent(me);
		}
		@Override public boolean onDown(MotionEvent e){return true;}
		//Captures relative velocity, which is used in NegoMain
		@Override public boolean onFling(MotionEvent e1, MotionEvent e2,
				float velocityX, float velocityY){
			main.fling(velocityX, velocityY);
			return false;
		}
		@Override public void onLongPress(MotionEvent e){}
		@Override public boolean onScroll(MotionEvent e1, MotionEvent e2,
				float distanceX, float distanceY){return false;}
		@Override public void onShowPress(MotionEvent e){}
		@Override public boolean onSingleTapUp(MotionEvent e){return false;}
	}
	//Main method equivalent - timer, orientation handling
	class NegoMain implements Runnable, SensorListener {
		int dest;
		public NegoMain(){
			player = new Player();
			//Listens for orientation changes
			((SensorManager) getSystemService(SENSOR_SERVICE)).
				registerListener(this, SensorManager.SENSOR_ORIENTATION);
		}
		//Handles basic timer events
		@Override public void run() {
			while (true){
				try {Thread.sleep(100);} catch(Exception e){}
				timer++;
				if (timer % 10 == 0)
					if (!player.down())
						player = new Player();
				//Moves toward absolute destination from accelerometer
				if (dest > player.x)
					player.right();
				else if (dest < player.x)
					player.left();
				view.postInvalidate();
			}
		}
		//Handles accelerometer events
		//TODO: Rewrite as relative motion instead of absolute positioning?
		@Override public void onAccuracyChanged(int acc, int exacc){}
		@Override public void onSensorChanged(int sensor, float[] values){
			if (timer % 2 == 0)
				dest = (int)((values[2] + 25) / 50 * board.length);
		}
		//Processes flings detected in NegoView
		public void fling(float velocityX, float velocityY){
			if (Math.abs(velocityX) > 500)
				player.rotate(velocityX > 0);
			else if (Math.abs(velocityY) > 500){
				player.sink();
			}
		}
	}
	//Simple struct
	class Block {
		public byte type;
		public int x, y;
	}
	//Main Player class - represents collection of four blocks
	class Player {
		Random r = new Random();
		//Attempt to remove repetitive code for block position
		byte[][] off = {{0,0},{1,0},{1,1},{0,1}};
		public int x, y, type = 0;
		public Block[] blocks = {new Block(), new Block(),
			new Block(), new Block()};
		public Player(){
			//Randomized type, dropping negatives due to odd Java handling
			int t = r.nextInt() & 0x0f0f0f0f;
			this.x = board.length / 2 - 1;
			//Sets actual internal block types
			for (int i = 0; i < blocks.length; i++){
				blocks[i].type = (byte)((t & (0xff << (8*i))) >> (8*i));
				if ((blocks[i].type & black_bit) == black_bit)
					blocks[i].type = (byte)(black_bit | exist_bit);
				else
					blocks[i].type = (byte)(white_bit | exist_bit);
				this.type |= (int)blocks[i].type << (8*i);
			}
			this.set_blocks_position();
		}
		//Updates positions for placement
		void set_blocks_position(){
			for (int i = 0; i < off.length; i++){
				blocks[i].x = x + off[i][0];
				blocks[i].y = y + off[i][1];
			}
		}
		//Drop if possible, regenerate a player block if necessary
		public boolean down(){
			boolean check = (y < board[0].length - 2 &&
					board[x][y+2] == 0 	&& board[x+1][y+2] == 0);
			if (check){
				this.y++;
				this.set_blocks_position();
			} else {
				for (Block b : this.blocks){
					board[b.x][b.y] = b.type;
				}
				player = new Player();
			}
			return check;
		}
		//Moves left if possible, returning success
		public boolean left(){
			boolean check = (x > 0 &&
					board[x-1][y] == 0 && board[x-1][y+1] == 0);
			if (check){
				this.x--;
				this.set_blocks_position();
			}
			return check;
		}
		//Moves right if possible, returning success
		public boolean right(){
			boolean check = (x < board.length - 2 && 
					board[x+2][y] == 0 && board[x+2][y+1] == 0);
			if (check){
				this.x++;
				this.set_blocks_position();
			}
			return check;
		}
		//Rotates the internal block types
		public void rotate(boolean left){
			if (left){
				byte t = blocks[0].type;
				for (int i = 0; i < this.blocks.length - 1; i++)
					blocks[i].type = blocks[i+1].type;
				blocks[blocks.length-1].type = t;
			} else {
				byte t = blocks[blocks.length-1].type;
				for (int i = this.blocks.length - 1; i > 0; i--)
					blocks[i].type = blocks[i-1].type;
				blocks[0].type = t;
			}
		}
		//Called to drop block until collision
		public void sink(){
			while (down());
		}
	}
}
