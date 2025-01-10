import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
type CoolInputProps = {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};type CoolButtonProps = {
  onClick: () => void;
};

export function CoolInput({ value, onChange }: CoolInputProps) {
  return <Input type="text"     value={value}
  onChange={onChange} placeholder="Enter your name" className="text-yellow-400"  />
}
export function CoolButton({ onClick }: CoolButtonProps){
  return <Button   onClick={onClick} variant="outline" >Demo Button</Button>


}