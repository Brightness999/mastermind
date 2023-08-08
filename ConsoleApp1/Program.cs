using System;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            Random random = new Random();
            int[] answer = new int[4];
            for (int i = 0; i < 4; i++)
            {
                answer[i] = random.Next(1, 7);
            }

            int attempts = 10;

            Console.WriteLine("Welcome to Mastermind!");
            Console.WriteLine("Try to guess the 4-digit number (each digit between 1 and 6).");
            Console.WriteLine($"You have {attempts} attempts.");

            for (int attempt = 1; attempt <= attempts; attempt++)
            {
                Console.Write($"Attempt {attempt}: ");
                string input = Console.ReadLine();

                if (input.Length != 4 || !int.TryParse(input, out int guess))
                {
                    Console.WriteLine("Invalid input. Please enter a 4-digit number.");
                    continue;
                }

                int[] guessDigits = new int[4];
                for (int i = 0; i < 4; i++)
                {
                    guessDigits[3-i] = guess % 10;
                    guess /= 10;
                }

                char[] result = new char[4];
                for (int i = 0; i < 4; i++)
                {
                    if (guessDigits[i] == answer[i])
                    {
                        result[i] = '+';
                    }
                    else if (Array.IndexOf(answer, guessDigits[i]) != -1)
                    {
                        result[i] = '-';
                    }
                }

                Array.Sort(result);
                Console.WriteLine($"Result: {new string(result)}");

                if (new string(result) == "++++")
                {
                    Console.WriteLine("Congratulations, you guessed the number!");
                    break;
                }

                if (attempt == attempts)
                {
                    Console.WriteLine($"You're out of attempts. The correct answer was {string.Join("", answer)}.");
                }
            }
            Console.WriteLine("Hello World!");
        }
    }
}
