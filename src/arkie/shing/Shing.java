package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import arkie.sprocket.Controller;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		Controller main = new Controller(this);
		
		short[][] map = new short[][]{{1,2,3,4},{5,6,7,8}};

		// TODO: Persistencize
		main.addSprocket(main.createTileset(R.drawable.chip, map));
		main.addSprocket(main.createPlayer(R.drawable.poke));

		setContentView(main.createView());
		main.run();
	}
}
