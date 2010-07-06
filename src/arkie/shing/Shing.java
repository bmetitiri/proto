package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import arkie.sprocket.Controller;
import arkie.sprocket.Player;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Controller main = new Controller(this);
		
		short[][] map = new short[][]{
			{5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,9,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,12,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,9,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,5},
			{5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5},
			};

		// TODO: Persistencize
		main.addSprocket(main.createTileset(R.drawable.chip, map));
		Player player = main.createPlayer(R.drawable.poke);
		main.addSprocket(player);

		setContentView(main.createView());
		player.setPosition(32, 32); player.setDestination(48, 48);
		main.run();
	}
}
